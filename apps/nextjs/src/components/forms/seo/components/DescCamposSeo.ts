export const seoValues = {
  title: "El título de la página", //`The title of the page.`,
  descriptionMeta: "Descripción concisa sobre la página.", //`Text that gives a concise description of what your page is about.`,
  //REVISAR tiene astro default
  canonical:
    "Previene problemas de contenido duplicado, especificando la url preferida.", //`Prevent duplicate content issues by specifying the "canonical" or "preferred" url of a web page. If you don't define this, Astro.request.url.href will be used as the default value.`,
  noindex: "Activar para que los motores de búsqueda no indexen la página.", //`Set this to true if you don't want search engines to index your page. Since this is an SEO component, this gets set to false by default. This way, indexing is strictly opt-out.`,
  nofollow:
    "Activar para que los motores de búsqueda no sigan los enlaces de la página.", //`Set this to true if you don't want search engines to follow links on your page. Since this is an SEO component, this gets set to false by default. This way, following links is strictly opt-out.`,
  charset: "Establezca el charset del documento. Generalmente es UTF-8.", //`Set the charset of the document. In almost all cases this should be UTF-8.`,
  openGraphBasicTitle:
    "Establezca el título para Open Graph. Generalmente deberá ser diferente al titulo. Si se define, se deberán definir valores de Type e Image", //`Set the title Open Graph should use. In most situations, this should be different from the value of the title prop. See this tweet to gain an understanding of the difference between the two. If you define this, you must define two other OG basic properties as well: type and image. (Learn more.)`,
  openGraphBasicType:
    "Establezca el type para Open Graph. Si se define, se deberán definir valores de Title e Image", //`Set the type Open Graph should use. If you define this, you must define two other OG basic properties as well: title and image. (Learn more.)`,
  openGraphBasicImage:
    "URL de la imágen que aparecerá en las redes sociales. Si se define, se deberán definir valores de Title y Type", //`URL of the image that should be used in social media previews. If you define this, you must define two other OG basic properties as well: title and type. (Learn more.)`,
  openGraphBasicUrl:
    "La URL canónica de su objeto que se usará como su ID permanente en el gráfico. Lo más probable es que sea la misma URL de la página o su URL canónica.", //`The canonical URL of your object that will be used as its permanent ID in the graph. Most likely either the url of the page or its canonical url (see above). If you define this, you must define the other 3 OG basic properties as well: title, type and image. (Learn more.). If you define the other 3 OG basic properties but don't define this, Astro.request.url.href will be used as the default value.`,
  openGraphOptionalAudio: "URL del audio que acompañará a este contenido.", //`A URL to an audio file to accompany this object.`,
  openGraphOptionalDescription:
    "Una o dos oraciones para describir el contenido.", //`A one to two sentence description of your object.`,
  openGraphOptionalDeterminer:
    "La palabra que aparecerá antes del título del contenido. Generalmente son artículos (El, La, Las, Los)", //`The word that appears before this object's title in a sentence. An enum of (a, an, the, "", auto). If auto is chosen, the consumer of your data should chose between "a" or "an". Default is "" (blank).`,
  openGraphOptionalLocale:
    "La localidad de las tags, con formato idioma_TERRITORIO. en_US por defecto", //`The locale these tags are marked up in. Of the format language_TERRITORY. Default is en_US.`,
  openGraphOptionalLocaleAlternate:
    "La variedad de localidades disponibles en la página", //`An array of other locales this page is available in.`,
  openGraphOptionalSiteName:
    'Si el contenido es parte de un sitio web mayor, aquí se deberá poner el name del sitio en general. ej. "Wikipedia"', //`If your object is part of a larger web site, the name which should be displayed for the overall site. e.g., "IMDb".`,
  openGraphOptionalVideo: "Una URL para el video que completa el contenido.", //`A URL to a video file that complements this object.`,
  openGraphImageUrl: "Por ahora, la configuración de esto se ignora.", //`For now, setting this is ignored. This is done because og:image:url is supposed to be identical to og:image. If you have a use case where it makes sense for these to be different, please feel free to contact me, and tell me about it and I will consider adding it. Until then, in the interest of enforcing best practices, the value of this property will be ignored and og:image:url set to the value of openGraph.basic.image.`,
  openGraphImageSecureUrl:
    "Una URL alternativa para usar si la página web requiere HTTPS.", //`Sets og:image:secure_url: An alternate url to use if the webpage requires HTTPS.`,
  openGraphImageType: 'Un type MIME para la image. p.ej. "image/jpeg"', //`Sets og:image:type. A MIME type for the image. e.g. "image/jpeg"`,
  openGraphImageWidth: "El número de píxeles de width.", //`Sets og:image:width. The number of pixels wide.`,
  openGraphImageHeight: "El número de píxeles de height.", //`Sets og:image:height. The number of pixels high.`,
  openGraphImageAlt:
    "Una descripción de lo que hay en la image (no un pie de foto). Si la página especifica Open Graph Basic Image, debe especificar OpenGraph Image Alt.", //`Sets og:image:alt. A description of what is in the image (not a caption). If the page specifies openGraph.basic.image it should specify openGraph.image.alt.`,
  openGraphArticlePublishedTime: `Sets article:published_time. The date the article was published. Must be a ISO 8601 DateTime string.`,
  openGraphArticleModifiedTime: `Sets article:modified_time. The date the article was last modified. Must be a ISO 8601 DateTime string.`,
  openGraphArticleExpirationTime: `Sets article:expiration_time. The date the article will no longer be relevant. Must be a ISO 8601 DateTime string.`,
  openGraphArticleAuthor:
    "Autor/a(s) del artículo, si es solo uno, pasa una matriz con una entrada.", //`Sets article:author. The author(s) of the article, if it's only one, pass an array with one entry. If there are multiple, multiple tags with descending relevance will be created.`,
  openGraphArticleSection:
    "Un name de sección de height nivel. P.ej. Tecnología", //`Sets article:section. A high-level section name. E.g. Technology`,
  openGraphArticleTags: "Etiquetas relacionadas con este artículo", //`Sets article:tag. Tag words associated with this article. If it's only one, pass an array with one entry. If there are multiple, multiple tags with descending relevance will be created.`,
  twitterCard:
    'Establece el type de tarjeta que será una de "summary", “summary_large_image”, “app”, o “player”.', //`Sets twitter:card. The card type, which will be one of “summary”, “summary_large_image”, “app”, or “player”.`,
  twitterSite:
    "Establece el user utilizado para el sitio web, en el pie de página.", //`Sets twitter:site. (Twitter) @username for the website used in the card footer.`,
  twitterCreator: "Establece el user del autor del contenido.", //`Sets twitter:creator. (Twitter) @username for the content creator / author.`,
};
