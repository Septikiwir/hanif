import { Metadata, ResolvingMetadata } from "next";
import { supabase } from "@/lib/supabase";
import TemplateV1 from "@/components/TemplateV1";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string; template: string }>;
};

// --- Dynamic Metadata Generation ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  // Fetch data for metadata
  const { data: inv } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!inv) return { title: "Undangan Tidak Ditemukan" };

  const content = inv.content || {};
  const bride = content.couple?.bride?.shortName || "Bride";
  const groom = content.couple?.groom?.shortName || "Groom";
  const title = `The Wedding of ${bride} & ${groom}`;
  const description = content.event?.displayDate || "Undangan Pernikahan Digital";
  
  // Use dedicated ogImage, otherwise fallback to opening photo or bride photo
  const ogImage = content.media?.ogImage || content.media?.openingPhoto || content.couple?.bride?.photo || "/preview (1).jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function InvitationPage({
  params,
}: Props) {
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
