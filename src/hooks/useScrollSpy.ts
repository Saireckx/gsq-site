import { useState, useEffect } from 'react';

export function useScrollSpy(ids: string[], offset: number = 120) {
  const [activeId, setActiveId] = useState<string>(ids[0] || '');

  useEffect(() => {
    if (!ids.length) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset;

      // Check if user is scrolled near the bottom of the page
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50
      ) {
        setActiveId(ids[ids.length - 1]);
        return;
      }

      // Find the current section
      let currentSectionId = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            currentSectionId = id;
          }
        }
      }

      setActiveId(currentSectionId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run initially
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [ids, offset]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.offsetTop - 100;
      window.scrollTo({
        top,
        behavior: 'smooth',
      });
      setActiveId(id);
    }
  };

  return { activeId, scrollTo };
}
