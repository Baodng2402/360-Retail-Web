import resourcesToBackend from "i18next-resources-to-backend";

const translationFiles = import.meta.glob("../locales/**/*.json", {
  import: "default",
});

export const resourcesBackend = resourcesToBackend(
  (language: string, namespace: string) => {
    const path = `../locales/${language}/${namespace}.json`;
    const loader = translationFiles[path as keyof typeof translationFiles];

    if (!loader) {
      return Promise.reject(
        new Error(`Missing i18n resource for ${language}/${namespace}`),
      );
    }

    return loader();
  },
);

