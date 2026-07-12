"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ExportJob,
  Presentation,
  Slide,
  Template,
  UploadedStyleReference,
  User,
} from "./types";
import { nowIso, uid } from "./utils";
import { BUILT_IN_TEMPLATES } from "./templates";
import { supabase, isSupabaseConfigured } from "./supabase";
import {
  loadPresentationsRemote,
  loadBrandThemesFromCloud,
  deletePresentationRemote,
  savePresentationRemote,
  type RemoteDeck,
} from "./supabaseSync";
import type { Session } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Persistence layer. Backed by localStorage today; the shape of `Db` is the
// contract a real backend would satisfy. Nothing in the UI reaches into
// localStorage directly — it goes through this store.
//
// Writes go through `commit`, which applies a functional updater against the
// latest committed state held in a ref. That lets several mutations run in a
// single event tick (e.g. create → add slides → mark ready) without reading a
// stale render-time snapshot and clobbering each other.
// ---------------------------------------------------------------------------

const KEY = "deckeflow.db.v1";
const SESSION_KEY = "deckeflow.session.v1";

interface Db {
  users: User[];
  presentations: Presentation[];
  slides: Slide[];
  uploadedTemplates: Template[];
  styleRefs: UploadedStyleReference[];
  exportJobs: ExportJob[];
}

function emptyDb(): Db {
  return {
    users: [],
    presentations: [],
    slides: [],
    uploadedTemplates: [],
    styleRefs: [],
    exportJobs: [],
  };
}

function loadDb(): Db {
  if (typeof window === "undefined") return emptyDb();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyDb();
    return { ...emptyDb(), ...JSON.parse(raw) };
  } catch {
    return emptyDb();
  }
}

function saveDb(db: Db) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(db));
}

// Signature of a deck's persisted state — used to skip redundant remote saves.
function deckSig(p: Presentation, slides: Slide[]): string {
  return p.updatedAt + "::" + JSON.stringify(slides);
}

// Replace a user's decks in the local db with the set loaded from Supabase.
function hydrateUserDecks(d: Db, userId: string, decks: RemoteDeck[]): Db {
  const keepPres = d.presentations.filter((p) => p.userId !== userId);
  const keepIds = new Set(keepPres.map((p) => p.id));
  const keepSlides = d.slides.filter((s) => keepIds.has(s.presentationId));
  return {
    ...d,
    presentations: [...keepPres, ...decks.map((x) => x.presentation)],
    slides: [...keepSlides, ...decks.flatMap((x) => x.slides)],
  };
}

function reindex(list: Slide[]): Slide[] {
  return [...list]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((s, i) => ({ ...s, orderIndex: i }));
}

// ---------------------------------------------------------------------------

interface StoreValue {
  ready: boolean;
  user: User | null;

  // auth
  login: (email: string) => User;
  signup: (name: string, email: string, company?: string) => User;
  logout: () => void;
  updateUser: (patch: Partial<Pick<User, "name" | "email" | "company">>) => void;

  // templates
  templates: Template[];
  addUploadedTemplate: (t: Omit<Template, "id" | "createdAt">) => Template;

  // style references
  styleRefs: UploadedStyleReference[];
  addStyleRef: (
    r: Omit<UploadedStyleReference, "id" | "createdAt" | "userId">,
  ) => UploadedStyleReference;

  // presentations
  presentations: Presentation[];
  getPresentation: (id: string) => Presentation | undefined;
  createPresentation: (
    p: Omit<Presentation, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => Presentation;
  updatePresentation: (id: string, patch: Partial<Presentation>) => void;
  deletePresentation: (id: string) => void;

  // slides
  slidesFor: (presentationId: string) => Slide[];
  setSlides: (presentationId: string, slides: Slide[]) => void;
  updateSlide: (id: string, patch: Partial<Slide>) => void;
  addSlide: (presentationId: string, afterOrderIndex?: number) => Slide;
  duplicateSlide: (id: string) => void;
  deleteSlide: (id: string) => void;
  reorderSlides: (presentationId: string, fromIndex: number, toIndex: number) => void;

  // export
  createExportJob: (
    presentationId: string,
    format: ExportJob["format"],
  ) => ExportJob;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Db>(emptyDb);
  const dbRef = useRef<Db>(db);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  // Tracks the last state synced to Supabase per deck, so we don't re-upsert
  // unchanged decks (or echo a just-loaded deck straight back).
  const syncedRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const loaded = loadDb();
    dbRef.current = loaded;
    setDb(loaded);
    // With Supabase, the session drives the user and readiness (below).
    if (!isSupabaseConfigured) {
      try {
        const sid = window.localStorage.getItem(SESSION_KEY);
        if (sid) {
          const u = loaded.users.find((x) => x.id === sid);
          if (u) setUser(u);
        }
      } catch {
        /* ignore */
      }
      setReady(true);
    }
  }, []);

  // Apply an updater against the latest committed state, then persist.
  const commit = useCallback((updater: (prev: Db) => Db) => {
    const next = updater(dbRef.current);
    dbRef.current = next;
    setDb(next);
    saveDb(next);
    return next;
  }, []);

  // ---- Supabase session: drive the user + load their decks ----
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let active = true;
    const apply = async (session: Session | null) => {
      if (!active) return;
      const su = session?.user;
      if (su) {
        const u: User = {
          id: su.id,
          name:
            (su.user_metadata?.name as string) ||
            su.email?.split("@")[0] ||
            "there",
          email: su.email ?? "",
          company: su.user_metadata?.company as string | undefined,
          createdAt: su.created_at ?? nowIso(),
        };
        setUser(u);
        const [decks, brands] = await Promise.all([
          loadPresentationsRemote(),
          loadBrandThemesFromCloud(),
        ]);
        if (!active) return;
        decks.forEach((x) =>
          syncedRef.current.set(x.presentation.id, deckSig(x.presentation, x.slides)),
        );
        commit((d) => {
          const withDecks = hydrateUserDecks(d, u.id, decks);
          if (!brands.length) return withDecks;
          const existingNames = new Set(
            withDecks.uploadedTemplates.map((t) => t.theme.brand?.name),
          );
          const newTemplates = brands
            .filter((b) => !existingNames.has(b.name))
            .map((brand) => ({
              id: uid("tpl"),
              name: brand.name || "Custom brand",
              category: "Uploaded",
              description:
                "Extracted from your uploaded PowerPoint — colors, fonts, and logo applied to every layout.",
              sourceType: "uploaded" as const,
              theme: {
                accent: `#${brand.roles?.primary ?? "2563EB"}`,
                surface: "#ffffff",
                ink: "#1c1917",
                fontFamily: "sans" as const,
                character: "Your brand · extracted",
                brand,
              },
              createdAt: nowIso(),
            }));
          return {
            ...withDecks,
            uploadedTemplates: [...withDecks.uploadedTemplates, ...newTemplates],
          };
        });
      } else {
        setUser(null);
      }
      setReady(true);
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      apply(session),
    );
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [commit]);

  // ---- Debounced write-through of the current user's decks to Supabase ----
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    const t = setTimeout(() => {
      const mine = dbRef.current.presentations.filter(
        (p) => p.userId === user.id,
      );
      for (const p of mine) {
        const slides = dbRef.current.slides
          .filter((s) => s.presentationId === p.id)
          .sort((a, b) => a.orderIndex - b.orderIndex);
        const sig = deckSig(p, slides);
        if (syncedRef.current.get(p.id) === sig) continue;
        syncedRef.current.set(p.id, sig);
        void savePresentationRemote(p, slides);
      }
    }, 900);
    return () => clearTimeout(t);
  }, [db.presentations, db.slides, user]);

  // ---- auth ----
  const signup = useCallback(
    (name: string, email: string, company?: string) => {
      const existing = dbRef.current.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      const u: User =
        existing ?? {
          id: uid("user"),
          name,
          email,
          company,
          createdAt: nowIso(),
        };
      if (!existing) commit((d) => ({ ...d, users: [...d.users, u] }));
      setUser(u);
      window.localStorage.setItem(SESSION_KEY, u.id);
      return u;
    },
    [commit],
  );

  const login = useCallback(
    (email: string) => {
      const existing = dbRef.current.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      // Demo-friendly: if no account exists, create a lightweight one.
      const u: User =
        existing ?? {
          id: uid("user"),
          name: email.split("@")[0].replace(/[._-]/g, " ") || "there",
          email,
          createdAt: nowIso(),
        };
      if (!existing) commit((d) => ({ ...d, users: [...d.users, u] }));
      setUser(u);
      window.localStorage.setItem(SESSION_KEY, u.id);
      return u;
    },
    [commit],
  );

  const logout = useCallback(() => {
    if (isSupabaseConfigured && supabase) void supabase.auth.signOut();
    setUser(null);
    window.localStorage.removeItem(SESSION_KEY);
  }, []);

  const updateUser = useCallback(
    (patch: Partial<Pick<User, "name" | "email" | "company">>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...patch };
        commit((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === prev.id ? updated : u)),
        }));
        return updated;
      });
    },
    [commit],
  );

  // ---- templates ----
  const templates = useMemo(
    () => [...BUILT_IN_TEMPLATES, ...db.uploadedTemplates],
    [db.uploadedTemplates],
  );

  const addUploadedTemplate = useCallback(
    (t: Omit<Template, "id" | "createdAt">) => {
      const tpl: Template = { ...t, id: uid("tpl"), createdAt: nowIso() };
      commit((d) => ({
        ...d,
        uploadedTemplates: [...d.uploadedTemplates, tpl],
      }));
      return tpl;
    },
    [commit],
  );

  const addStyleRef = useCallback(
    (r: Omit<UploadedStyleReference, "id" | "createdAt" | "userId">) => {
      const ref: UploadedStyleReference = {
        ...r,
        id: uid("ref"),
        userId: user?.id ?? "anon",
        createdAt: nowIso(),
      };
      commit((d) => ({ ...d, styleRefs: [...d.styleRefs, ref] }));
      return ref;
    },
    [commit, user],
  );

  // ---- presentations ----
  const presentations = useMemo(
    () =>
      db.presentations
        .filter((p) => !user || p.userId === user.id)
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [db.presentations, user],
  );

  const getPresentation = useCallback(
    (id: string) => db.presentations.find((p) => p.id === id),
    [db.presentations],
  );

  const createPresentation = useCallback(
    (p: Omit<Presentation, "id" | "userId" | "createdAt" | "updatedAt">) => {
      const pres: Presentation = {
        ...p,
        id: uid("pres"),
        userId: user?.id ?? "anon",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      commit((d) => ({ ...d, presentations: [...d.presentations, pres] }));
      return pres;
    },
    [commit, user],
  );

  const updatePresentation = useCallback(
    (id: string, patch: Partial<Presentation>) => {
      commit((d) => ({
        ...d,
        presentations: d.presentations.map((p) =>
          p.id === id ? { ...p, ...patch, updatedAt: nowIso() } : p,
        ),
      }));
    },
    [commit],
  );

  const deletePresentation = useCallback(
    (id: string) => {
      commit((d) => ({
        ...d,
        presentations: d.presentations.filter((p) => p.id !== id),
        slides: d.slides.filter((s) => s.presentationId !== id),
      }));
      syncedRef.current.delete(id);
      if (isSupabaseConfigured) void deletePresentationRemote(id);
    },
    [commit],
  );

  // ---- slides ----
  const slidesFor = useCallback(
    (presentationId: string) =>
      db.slides
        .filter((s) => s.presentationId === presentationId)
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [db.slides],
  );

  const setSlides = useCallback(
    (presentationId: string, slides: Slide[]) => {
      commit((d) => ({
        ...d,
        slides: [
          ...d.slides.filter((s) => s.presentationId !== presentationId),
          ...slides,
        ],
      }));
    },
    [commit],
  );

  const updateSlide = useCallback(
    (id: string, patch: Partial<Slide>) => {
      commit((d) => ({
        ...d,
        slides: d.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }));
    },
    [commit],
  );

  const addSlide = useCallback(
    (presentationId: string, afterOrderIndex?: number) => {
      const fresh: Slide = {
        id: uid("slide"),
        presentationId,
        orderIndex: 0,
        title: "New slide",
        content: ["Add your point here"],
        speakerNotes: "",
        layoutType: "content",
      };
      commit((d) => {
        const current = d.slides
          .filter((s) => s.presentationId === presentationId)
          .sort((a, b) => a.orderIndex - b.orderIndex);
        const at =
          afterOrderIndex === undefined ? current.length : afterOrderIndex + 1;
        fresh.orderIndex = at;
        const shifted = current.map((s) =>
          s.orderIndex >= at ? { ...s, orderIndex: s.orderIndex + 1 } : s,
        );
        return {
          ...d,
          slides: [
            ...d.slides.filter((s) => s.presentationId !== presentationId),
            ...reindex([...shifted, fresh]),
          ],
        };
      });
      return fresh;
    },
    [commit],
  );

  const duplicateSlide = useCallback(
    (id: string) => {
      commit((d) => {
        const target = d.slides.find((s) => s.id === id);
        if (!target) return d;
        const copy: Slide = {
          ...target,
          id: uid("slide"),
          title: `${target.title} (copy)`,
          orderIndex: target.orderIndex + 1,
        };
        const siblings = d.slides
          .filter((s) => s.presentationId === target.presentationId)
          .map((s) =>
            s.orderIndex > target.orderIndex
              ? { ...s, orderIndex: s.orderIndex + 1 }
              : s,
          );
        return {
          ...d,
          slides: [
            ...d.slides.filter(
              (s) => s.presentationId !== target.presentationId,
            ),
            ...reindex([...siblings, copy]),
          ],
        };
      });
    },
    [commit],
  );

  const deleteSlide = useCallback(
    (id: string) => {
      commit((d) => {
        const target = d.slides.find((s) => s.id === id);
        if (!target) return d;
        const remaining = d.slides.filter(
          (s) => s.presentationId === target.presentationId && s.id !== id,
        );
        return {
          ...d,
          slides: [
            ...d.slides.filter(
              (s) => s.presentationId !== target.presentationId,
            ),
            ...reindex(remaining),
          ],
        };
      });
    },
    [commit],
  );

  const reorderSlides = useCallback(
    (presentationId: string, fromIndex: number, toIndex: number) => {
      commit((d) => {
        const list = d.slides
          .filter((s) => s.presentationId === presentationId)
          .sort((a, b) => a.orderIndex - b.orderIndex);
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= list.length ||
          toIndex >= list.length
        )
          return d;
        const [moved] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, moved);
        return {
          ...d,
          slides: [
            ...d.slides.filter((s) => s.presentationId !== presentationId),
            ...list.map((s, i) => ({ ...s, orderIndex: i })),
          ],
        };
      });
    },
    [commit],
  );

  // ---- export ----
  const createExportJob = useCallback(
    (presentationId: string, format: ExportJob["format"]) => {
      const job: ExportJob = {
        id: uid("export"),
        presentationId,
        status: "queued",
        format,
        createdAt: nowIso(),
      };
      commit((d) => ({ ...d, exportJobs: [...d.exportJobs, job] }));
      return job;
    },
    [commit],
  );

  const value: StoreValue = {
    ready,
    user,
    login,
    signup,
    logout,
    updateUser,
    templates,
    addUploadedTemplate,
    styleRefs: db.styleRefs,
    addStyleRef,
    presentations,
    getPresentation,
    createPresentation,
    updatePresentation,
    deletePresentation,
    slidesFor,
    setSlides,
    updateSlide,
    addSlide,
    duplicateSlide,
    deleteSlide,
    reorderSlides,
    createExportJob,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
