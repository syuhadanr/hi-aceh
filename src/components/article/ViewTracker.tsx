"use client";

import { useEffect } from "react";

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const trackView = async () => {
      try {
        console.log("ViewTracker: Tracking view for slug:", slug);
        const response = await fetch(`/api/views/${slug}`, { 
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("ViewTracker: View tracked successfully", data);
        } else {
          const error = await response.json();
          console.error("ViewTracker: Failed to track view", response.status, error);
        }
      } catch (error) {
        console.error("ViewTracker: Error tracking view", error);
      }
    };

    trackView();
  }, [slug]);

  return null;
}


