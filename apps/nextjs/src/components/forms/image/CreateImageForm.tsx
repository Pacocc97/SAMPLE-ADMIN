import { useEffect, useRef, useState, type ElementRef } from "react";

import { Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import type { Size } from "~/types/types";
import ImageFormElement from "../elements/ImageFormElement";

export default function CreateImageForm() {
  const utils = trpc.useContext();

  const { mutateAsync: imageMutator, isLoading: creadoImage } =
    trpc.image.create.useMutation({
      async onSuccess() {
        await Toast.fire({
          title: "La imagen ha sido añadido",
          icon: "success",
        });
        await utils.image.all.invalidate();
      },
      async onError(e) {
        await Toast.fire({
          title: "La imagen no se pudo añadir",
          icon: "error",
        });
      },
    });

  const [imageError, setImageError] = useState<string | undefined>(undefined);
  const [base64Image, setBase64Image] = useState<string>();
  const [altImage, setAltImage] = useState<string | null>();
  const [fileName, setFileName] = useState<string>();

  const imageRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const size: Size = {
    width: undefined,
    height: undefined,
  };

  /**
   * Submits form data.
   * - Checks if image was submitted properly.
   * - Connects imageId and categories to image.
   *
   * @param {CreateImageFormValues} data
   * @returns
   */
  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (base64Image === undefined) {
      setImageError("Porfavor suba una imagen");
      return;
    }
    const imageResponse = await imageMutator({
      path: "images/",
      image: base64Image,
      size,
      alt: altImage,
      name: fileName,
    });
    if (imageResponse === undefined) {
      setImageError("Algo salió mal mientras se subía la imagen");
      return;
    }
  }

  useEffect(() => {
    if (base64Image) {
      setImageError(undefined);
    }
  }, [base64Image]);

  return (
    <form onSubmit={submitForm}>
      <ImageFormElement
        name="Imagen"
        error={imageError}
        size={size}
        image={base64Image}
        setImage={setBase64Image}
        ref={imageRef}
        altImage={altImage}
        setAltImage={setAltImage}
        setFileName={setFileName}
      />

      <LinkElement
        href={`/admin/imagen`}
        size="sm"
        intent="primary"
        className="mr-2"
      >
        Volver
      </LinkElement>
      {!creadoImage && (
        <ButtonElement type="submit" intent="primary">
          Subir
        </ButtonElement>
      )}
      {creadoImage && (
        <ButtonElement type="button" disabled intent="primary">
          <Spinner
            classNameDiv="none"
            classNameSVG="w-5 h-5 mr-3 animate-spin"
          />
          Subiendo...
        </ButtonElement>
      )}
    </form>
  );
}
