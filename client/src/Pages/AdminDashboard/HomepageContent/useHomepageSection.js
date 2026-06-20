import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { editData, fetchDataFromApi } from "../../../utils/api";
import {
  defaultHomepageContent,
  getSampleHomepageContent,
} from "./homepageContentDefaults";

export function useHomepageSection(sectionKey) {
  const { setAlertBox } = useOutletContext();
  const [formFields, setFormFields] = useState({
    ...defaultHomepageContent[sectionKey],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [fullContent, setFullContent] = useState(null);

  const loadContent = useCallback(() => {
    fetchDataFromApi("/api/homepage-content")
      .then((res) => {
        const content = res?.content;
        if (content?.[sectionKey]) {
          setFormFields({ ...defaultHomepageContent[sectionKey], ...content[sectionKey] });
          setFullContent(content);
          setUsingSampleData(false);
        } else {
          const sample = getSampleHomepageContent();
          setFormFields({ ...defaultHomepageContent[sectionKey], ...sample[sectionKey] });
          setFullContent(sample);
          setUsingSampleData(true);
        }
      })
      .catch(() => {
        const sample = getSampleHomepageContent();
        setFormFields({ ...defaultHomepageContent[sectionKey], ...sample[sectionKey] });
        setFullContent(sample);
        setUsingSampleData(true);
      });
  }, [sectionKey]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadContent();
  }, [loadContent]);

  const saveSection = (sectionPayload) => {
    setIsLoading(true);
    const payload = {
      ...(fullContent || defaultHomepageContent),
      [sectionKey]: sectionPayload,
    };

    return editData("/api/homepage-content", payload)
      .then((res) => {
        const content = res?.content || payload;
        setFullContent(content);
        setFormFields({ ...defaultHomepageContent[sectionKey], ...content[sectionKey] });
        setUsingSampleData(false);
        setAlertBox?.({ open: true, error: false, msg: "Homepage section updated." });
      })
      .catch(() => {
        setFormFields(sectionPayload);
        setFullContent(payload);
        setAlertBox?.({ open: true, error: true, msg: "Failed to save homepage section." });
      })
      .finally(() => setIsLoading(false));
  };

  return {
    formFields,
    setFormFields,
    isLoading,
    usingSampleData,
    saveSection,
    reload: loadContent,
  };
}
