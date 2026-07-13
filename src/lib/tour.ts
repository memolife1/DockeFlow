"use client";

// Onboarding product tour. driver.js is lazy-loaded so it never adds weight
// to the main bundle; its stylesheet is a global CSS import in the root
// layout (Next.js only allows global CSS from there).

export async function startTour() {
  const { driver } = await import("driver.js");

  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: "rgba(0, 0, 0, 0.55)",
    popoverClass: "deckeflow-tour",
    steps: [
      {
        element: "[data-tour='new-button']",
        popover: {
          title: "Create your first deck 🎯",
          description:
            "Click here to start. Give it a topic, some notes, pick your tone — and let DeckeFlow do the rest in seconds.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "[data-tour='dashboard-list']",
        popover: {
          title: "Your presentations live here",
          description:
            "All your decks in one place. Click any card to open the editor, or use the ··· menu to rename, duplicate, or delete.",
          side: "top",
        },
      },
      {
        element: "[data-tour='sidebar-templates']",
        popover: {
          title: "Templates & brand kits",
          description:
            "Choose from 16 built-in themes, or upload your company's .pptx to auto-extract your brand colors, fonts, and logo.",
          side: "right",
        },
      },
      {
        element: "[data-tour='sidebar-images']",
        popover: {
          title: "Your photo library",
          description:
            "Upload your own images here — event photos, product shots, team photos — and they'll appear in your slides instead of stock images.",
          side: "right",
        },
      },
      {
        element: "[data-tour='sidebar-settings']",
        popover: {
          title: "Account settings",
          description:
            "Manage your account, set your default language, and connect your workspace. You're all set — let's make something great.",
          side: "right",
        },
      },
    ],
    onDestroyStarted: () => {
      driverObj.destroy();
      try {
        localStorage.setItem("df_tour_done", "1");
      } catch {
        /* ignore */
      }
    },
  });

  driverObj.drive();
}
