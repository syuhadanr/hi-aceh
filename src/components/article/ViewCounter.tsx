"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export default function ViewCounter({ slug }: { slug: string }) {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViewCount = async () => {
      try {
        const response = await fetch(`/api/articles/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setViewCount(data.viewCount);
        }
      } catch (error) {
        console.error("Error fetching view count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchViewCount();
  }, [slug]);

  if (loading || viewCount === null) {
    return <span className="text-gray-500">0 Views</span>;
  }

  return (
    <span className="flex items-center gap-1">
      <Eye className="w-4 h-4" />
      {viewCount.toLocaleString("id-ID")} Views
    </span>
  );
}
