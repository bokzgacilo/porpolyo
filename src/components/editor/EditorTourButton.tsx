"use client";

import { IconButton } from "@chakra-ui/react";
import type { Driver } from "driver.js";
import { useCallback, useEffect, useRef } from "react";
import { LuCircleHelp } from "react-icons/lu";

const editorTourStorageKey = "porpolyo.editor-tour.v1";

export function EditorTourButton({
  alwaysOpen,
  onBeforeStart,
}: {
  alwaysOpen: boolean;
  onBeforeStart: () => void;
}) {
  const driverRef = useRef<Driver>();
  const startingRef = useRef(false);
  const onBeforeStartRef = useRef(onBeforeStart);

  useEffect(() => {
    onBeforeStartRef.current = onBeforeStart;
  }, [onBeforeStart]);

  const startTour = useCallback(() => {
    if (startingRef.current || driverRef.current?.isActive()) return;

    startingRef.current = true;
    onBeforeStartRef.current();

    window.setTimeout(async () => {
      const { driver } = await import("driver.js");
      const editorTour = driver({
        animate: true,
        allowClose: true,
        allowKeyboardControl: true,
        disableActiveInteraction: true,
        overlayColor: "#0f172a",
        overlayOpacity: 0.68,
        popoverClass: "porpolyo-driver-popover",
        popoverOffset: 14,
        showProgress: true,
        stagePadding: 8,
        stageRadius: 10,
        progressText: "Step {{current}} of {{total}}",
        nextBtnText: "Next",
        prevBtnText: "Back",
        doneBtnText: "Start editing",
        onDestroyed: () => {
          driverRef.current = undefined;
          startingRef.current = false;
        },
        steps: [
          {
            element: '[data-tour="structure-panel"]',
            popover: {
              title: "Structure and layers",
              description:
                "Organize page sections here. Expand a section to select its text, images, navigation links, and other editable layers.",
              side: "right",
              align: "start",
            },
          },
          {
            element: '[data-tour="canvas"]',
            popover: {
              title: "Portfolio canvas",
              description:
                "Select elements directly on the page, preview desktop, tablet, and mobile widths, adjust zoom, or hold Space and drag to pan.",
              side: "top",
              align: "center",
            },
          },
          {
            element: '[data-tour="properties-panel"]',
            popover: {
              title: "Content and styling",
              description:
                "Edit the selected element here. Content changes its information, while Styling controls typography, color, size, spacing, and borders.",
              side: "left",
              align: "start",
            },
          },
        ],
      });

      driverRef.current = editorTour;
      editorTour.drive();
    }, 240);
  }, []);

  useEffect(() => {
    if (
      !alwaysOpen &&
      window.localStorage.getItem(editorTourStorageKey)
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (!alwaysOpen) {
        window.localStorage.setItem(editorTourStorageKey, "seen");
      }
      startTour();
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [alwaysOpen, startTour]);

  useEffect(
    () => () => {
      driverRef.current?.destroy();
    },
    [],
  );

  return (
    <IconButton
      aria-label="Take the editor tour"
      title="Editor tour"
      onClick={startTour}
      variant="ghost"
      rounded={0}
    >
      <LuCircleHelp size={17} />
    </IconButton>
  );
}
