interface SesmHeroImageProps {
  src: string;
  alt: string;
  title: string;
  description?: string;
  aspect?: "classic" | "wide";
}

const SesmHeroImage = ({
  src,
  alt,
  title,
  description,
  aspect = "classic",
}: SesmHeroImageProps) => (
  <div
    className={`mx-auto w-full ${
      aspect === "wide" ? "max-w-[860px]" : "max-w-[620px]"
    }`}
  >
    <div className="overflow-hidden rounded-[8px] border border-atl-ridge/70 bg-atl-void/70 shadow-[0_0_24px_rgba(95,165,196,0.12)]">
      <img
        src={src}
        alt={alt}
        className={`block w-full object-cover ${
          aspect === "wide"
            ? "aspect-[1672/941] max-h-[460px]"
            : "aspect-[1448/1086] max-h-[500px]"
        }`}
        loading="eager"
        decoding="async"
      />
    </div>
    <div className="sr-only">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  </div>
);

export default SesmHeroImage;
