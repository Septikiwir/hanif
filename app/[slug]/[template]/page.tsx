import { supabase } from "@/lib/supabase";
import TemplateV1 from "@/components/TemplateV1";
import { notFound } from "next/navigation";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ slug: string; template: string }>;
}) {
  const { slug, template } = await params;

  // 1. Fetch data dari Supabase
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .single();

  // 2. Error handling
  if (error || !invitation) {
    console.error("Error fetching invitation:", error);
    return notFound();
  }

  // 3. Render template berdasarkan parameter [template] di URL
  // Saat ini baru tersedia v1 (Fizah-Hanif look)
  switch (template) {
    case "v1":
      return <TemplateV1 data={invitation.content as any} slug={slug} />;
    default:
      return (
        <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif" }}>
          <h1>Template {template} Belum Tersedia</h1>
          <p>Silakan gunakan v1 untuk melihat undangan.</p>
        </div>
      );
  }
}
