"use client";

import React from "react";
import ArticleForm from "src/components/admin/article-form";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const resolvedParams = React.use(params);
  return <ArticleForm articleId={resolvedParams.id} />;
}
