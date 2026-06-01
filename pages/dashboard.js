// PATCH dashboard.js — 2 modifications à apporter
// ─────────────────────────────────────────────────────────────────────────────
//
// MODIFICATION 1 : Ajouter la fonction runIcalSync après la déclaration des états
// (après la ligne : const [cleaningData, setCleaningData] = useState({});)
//
// ─────────────────────────────────────────────────────────────────────────────

  // ── iCal Sync silencieux ──────────────────────────────────────────────────
  // Déclenché au montage de la page et à chaque retour sur le dashboard.
  // S'exécute en arrière-plan sans bloquer l'UI ni afficher de loader.
  const runIcalSync = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await fetch('/api/ical-sync-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      // Pas de gestion du résultat — silencieux par design
    } catch {
      // Silencieux — ne jamais bloquer le dashboard pour ça
    }
  };

// ─────────────────────────────────────────────────────────────────────────────
//
// MODIFICATION 2 : Remplacer le useEffect existant par celui-ci
// (remplace le bloc useEffect({ fetchData(); if (router.query.success)... }, [router.query]))
//
// ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Chargement des données du dashboard
    fetchData();

    // Sync iCal au premier montage (silencieux)
    runIcalSync();

    // Sync iCal à chaque retour sur la page (via ?success= ou navigation)
    if (router.query.success) {
      const timer = setTimeout(() => fetchData(), 1500);
      return () => clearTimeout(timer);
    }
  }, [router.query]);

  useEffect(() => {
    // Sync iCal à chaque fois que la page redevient visible
    // (ex: l'hôte revient depuis edit-property, settings, etc.)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runIcalSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
