/* ═══════════════════════════════════════════════════════════════
   community-hub-i18n.js
   Sistema di internazionalizzazione per Community Hub — LuxHaven360
   Lingue supportate: IT (default), EN, FR, DE, ES
   ═══════════════════════════════════════════════════════════════ */

window._i18nCurrentLang = (function() {
  try { return localStorage.getItem('lh360_lang') || 'it'; } catch(e) { return 'it'; }
})();

/* ═══════════════════════════════════════════════════════════════
   DIZIONARIO TRADUZIONI
   ═══════════════════════════════════════════════════════════════ */
window._i18nDict = {

  /* ─────────────────────────────────────────
     LOGIN GATE
  ───────────────────────────────────────── */
  'login.subtitle':         { it:'Community Hub — Members Only', en:'Community Hub — Members Only', fr:'Community Hub — Membres Exclusifs', de:'Community Hub — Nur für Mitglieder', es:'Community Hub — Solo Miembros' },
  'login.title':            { it:'Accesso Esclusivo', en:'Exclusive Access', fr:'Accès Exclusif', de:'Exklusiver Zugang', es:'Acceso Exclusivo' },
  'login.desc':             { it:"Area riservata ai membri della Community LuxHaven360. L'accesso è consentito solo a utenti autorizzati.", en:'Area reserved for LuxHaven360 Community members. Access is granted only to authorized users.', fr:'Espace réservé aux membres de la Communauté LuxHaven360. L\'accès est réservé aux utilisateurs autorisés.', de:'Bereich für LuxHaven360-Community-Mitglieder. Der Zugang ist nur für autorisierte Nutzer gestattet.', es:'Área reservada a los miembros de la Comunidad LuxHaven360. El acceso está permitido solo a usuarios autorizados.' },
  'login.email_label':      { it:'Email', en:'Email', fr:'E-mail', de:'E-Mail', es:'Correo electrónico' },
  'login.pass_label':       { it:'Password', en:'Password', fr:'Mot de passe', de:'Passwort', es:'Contraseña' },
  'login.email_placeholder':{ it:'email@dominio.com', en:'email@domain.com', fr:'email@domaine.com', de:'email@domain.de', es:'email@dominio.com' },
  'login.pass_placeholder': { it:'••••••••', en:'••••••••', fr:'••••••••', de:'••••••••', es:'••••••••' },
  'login.btn':              { it:'Accedi alla Community', en:'Join the Community', fr:'Accéder à la Communauté', de:'Zur Community anmelden', es:'Acceder a la Comunidad' },
  'login.error_invalid':    { it:'Credenziali non valide. Riprova.', en:'Invalid credentials. Please try again.', fr:'Identifiants invalides. Veuillez réessayer.', de:'Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.', es:'Credenciales no válidas. Inténtalo de nuevo.' },
  'login.error_required':   { it:'Inserisci email e password.', en:'Please enter your email and password.', fr:'Veuillez saisir votre e-mail et votre mot de passe.', de:'Bitte E-Mail und Passwort eingeben.', es:'Por favor, introduce tu correo y contraseña.' },
  'login.credentials_title':{ it:'Hai perso le credenziali?', en:'Lost your credentials?', fr:'Vous avez perdu vos identifiants?', de:'Zugangsdaten vergessen?', es:'¿Perdiste tus credenciales?' },
  'login.credentials_text': { it:'Le credenziali ti sono state inviate via email al momento della prenotazione.', en:'Your credentials were sent to you by email at the time of booking.', fr:'Vos identifiants vous ont été envoyés par e-mail lors de la réservation.', de:'Ihre Zugangsdaten wurden Ihnen bei der Buchung per E-Mail zugesandt.', es:'Las credenciales te fueron enviadas por correo electrónico en el momento de la reserva.' },
  'login.founder_access':   { it:'Accesso Fondatore', en:'Founder Access', fr:'Accès Fondateur', de:'Gründer-Zugang', es:'Acceso Fundador' },
  'login.verifying':        { it:'Verifica in corso…', en:'Verifying…', fr:'Vérification en cours…', de:'Überprüfung läuft…', es:'Verificando…' },
  'login.connecting':       { it:'Connessione in corso…', en:'Connecting…', fr:'Connexion en cours…', de:'Verbindung wird hergestellt…', es:'Conectando…' },

  /* ─────────────────────────────────────────
     SIDEBAR — NAVIGAZIONE
  ───────────────────────────────────────── */
  'nav.main_label':         { it:'Principale', en:'Main', fr:'Principal', de:'Hauptmenü', es:'Principal' },
  'nav.dashboard':          { it:'Dashboard', en:'Dashboard', fr:'Tableau de bord', de:'Dashboard', es:'Panel de control' },
  'nav.feed':               { it:'Feed Aggiornamenti', en:'Updates Feed', fr:'Fil d\'actualités', de:'Neuigkeiten-Feed', es:'Feed de actualizaciones' },
  'nav.discussions':        { it:'Discussioni', en:'Discussions', fr:'Discussions', de:'Diskussionen', es:'Discusiones' },
  'nav.messages':           { it:'Messaggi', en:'Messages', fr:'Messages', de:'Nachrichten', es:'Mensajes' },
  'nav.content_label':      { it:'Contenuti', en:'Content', fr:'Contenu', de:'Inhalte', es:'Contenidos' },
  'nav.listings':           { it:'Listing Esclusivi', en:'Exclusive Listings', fr:'Annonces Exclusives', de:'Exklusive Angebote', es:'Anuncios Exclusivos' },
  'nav.surveys':            { it:'Sondaggi & Feedback', en:'Surveys & Feedback', fr:'Sondages & Retours', de:'Umfragen & Feedback', es:'Encuestas & Feedback' },
  'nav.notifications':      { it:'Notifiche', en:'Notifications', fr:'Notifications', de:'Benachrichtigungen', es:'Notificaciones' },
  'nav.personal_label':     { it:'Personale', en:'Personal', fr:'Personnel', de:'Persönlich', es:'Personal' },
  'nav.profile':            { it:'Il Mio Profilo', en:'My Profile', fr:'Mon Profil', de:'Mein Profil', es:'Mi Perfil' },
  'nav.admin_label':        { it:'Amministrazione', en:'Administration', fr:'Administration', de:'Verwaltung', es:'Administración' },
  'nav.members':            { it:'Gestione Membri', en:'Member Management', fr:'Gestion des Membres', de:'Mitgliederverwaltung', es:'Gestión de Miembros' },
  'nav.broadcast':          { it:'Comunicazioni', en:'Communications', fr:'Communications', de:'Kommunikation', es:'Comunicaciones' },
  'nav.moderation':         { it:'Moderazione', en:'Moderation', fr:'Modération', de:'Moderation', es:'Moderación' },
  'nav.analytics':          { it:'Analytics', en:'Analytics', fr:'Analytique', de:'Analytik', es:'Analítica' },
  'nav.sidebar_sub':        { it:'Community Hub', en:'Community Hub', fr:'Community Hub', de:'Community Hub', es:'Community Hub' },

  /* ─────────────────────────────────────────
     HEADER
  ───────────────────────────────────────── */
  'header.search_placeholder': { it:'Cerca nella Community…', en:'Search the Community…', fr:'Rechercher dans la Communauté…', de:'Community durchsuchen…', es:'Buscar en la Comunidad…' },
  'header.notifications':      { it:'Notifiche', en:'Notifications', fr:'Notifications', de:'Benachrichtigungen', es:'Notificaciones' },
  'header.mark_all_read':      { it:'Segna tutte come lette', en:'Mark all as read', fr:'Tout marquer comme lu', de:'Alle als gelesen markieren', es:'Marcar todas como leídas' },
  'header.back_to_community':  { it:'Torna alla pagina Community', en:'Back to Community page', fr:'Retour à la page Communauté', de:'Zurück zur Community-Seite', es:'Volver a la página de la Comunidad' },
  'header.logout':             { it:'Esci', en:'Logout', fr:'Se déconnecter', de:'Abmelden', es:'Cerrar sesión' },
  'header.badge_team':         { it:'⬡ Team LuxHaven360', en:'⬡ Team LuxHaven360', fr:'⬡ Équipe LuxHaven360', de:'⬡ Team LuxHaven360', es:'⬡ Equipo LuxHaven360' },
  'header.badge_founding':     { it:'★ Founding Member', en:'★ Founding Member', fr:'★ Membre Fondateur', de:'★ Gründungsmitglied', es:'★ Miembro Fundador' },
  'header.badge_candidate':    { it:'◈ Founder Candidate', en:'◈ Founder Candidate', fr:'◈ Candidat Fondateur', de:'◈ Gründungskandidat', es:'◈ Candidato Fundador' },

  /* ─────────────────────────────────────────
     DASHBOARD
  ───────────────────────────────────────── */
  'dash.subtitle':          { it:'Panoramica della tua Community LuxHaven360', en:'Overview of your LuxHaven360 Community', fr:'Aperçu de votre Communauté LuxHaven360', de:'Übersicht Ihrer LuxHaven360 Community', es:'Resumen de tu Comunidad LuxHaven360' },
  'dash.active_members':    { it:'Membri Attivi', en:'Active Members', fr:'Membres Actifs', de:'Aktive Mitglieder', es:'Miembros Activos' },
  'dash.feed_updates':      { it:'Aggiornamenti del Progetto', en:'Project Updates', fr:'Mises à jour du Projet', de:'Projektaktualisierungen', es:'Actualizaciones del Proyecto' },
  'dash.founding_members':  { it:'Founding Members', en:'Founding Members', fr:'Membres Fondateurs', de:'Gründungsmitglieder', es:'Miembros Fundadores' },
  'dash.founding_spots':    { it:'Posti Founding Member', en:'Founding Member Slots', fr:'Places Membres Fondateurs', de:'Gründungsmitglied-Plätze', es:'Plazas de Miembro Fundador' },
  'dash.last_30_days':      { it:'Ultimi 30 giorni', en:'Last 30 days', fr:'30 derniers jours', de:'Letzte 30 Tage', es:'Últimos 30 días' },
  'dash.total_spots_suffix':{ it:'su {n} posti totali', en:'of {n} total slots', fr:'sur {n} places au total', de:'von {n} Gesamtplätzen', es:'de {n} plazas totales' },
  'dash.slot_available_s':  { it:'Slot disponibile', en:'Slot available', fr:'Place disponible', de:'Platz verfügbar', es:'Plaza disponible' },
  'dash.slots_available_p': { it:'Slot disponibili', en:'Slots available', fr:'Places disponibles', de:'Plätze verfügbar', es:'Plazas disponibles' },
  'dash.all_spots_taken':   { it:'Tutti i posti esauriti', en:'All slots taken', fr:'Toutes les places sont prises', de:'Alle Plätze belegt', es:'Todas las plazas ocupadas' },
  'dash.recent_activity':   { it:'Attività Recente', en:'Recent Activity', fr:'Activité Récente', de:'Letzte Aktivität', es:'Actividad Reciente' },
  'dash.clear':             { it:'Svuota', en:'Clear', fr:'Vider', de:'Leeren', es:'Vaciar' },
  'dash.latest_updates':    { it:'Ultimi Aggiornamenti', en:'Latest Updates', fr:'Dernières Mises à Jour', de:'Neueste Updates', es:'Últimas Actualizaciones' },
  'dash.see_all':           { it:'Vedi tutti →', en:'See all →', fr:'Voir tout →', de:'Alle anzeigen →', es:'Ver todos →' },
  'dash.founder_status':    { it:'Stato Founder', en:'Founder Status', fr:'Statut Fondateur', de:'Gründerstatus', es:'Estado Fundador' },
  'dash.no_activity':       { it:'Nessuna attività recente.', en:'No recent activity.', fr:'Aucune activité récente.', de:'Keine aktuellen Aktivitäten.', es:'Sin actividad reciente.' },
  'dash.no_team_updates':   { it:'Nessun aggiornamento recente dal Team.', en:'No recent updates from the Team.', fr:'Aucune mise à jour récente de l\'équipe.', de:'Keine aktuellen Updates vom Team.', es:'Sin actualizaciones recientes del equipo.' },
  'dash.no_updates':        { it:'Nessun aggiornamento disponibile.\nIl team pubblicherà presto il primo contenuto.', en:'No updates available.\nThe team will publish the first content soon.', fr:'Aucune mise à jour disponible.\nL\'équipe publiera bientôt le premier contenu.', de:'Keine Updates verfügbar.\nDas Team wird bald den ersten Inhalt veröffentlichen.', es:'No hay actualizaciones disponibles.\nEl equipo publicará pronto el primer contenido.' },
  'dash.no_change_week':    { it:'Nessuna variazione questa settimana', en:'No change this week', fr:'Aucun changement cette semaine', de:'Keine Veränderung diese Woche', es:'Sin cambios esta semana' },
  'dash.new_this_week':     { it:'questa settimana', en:'this week', fr:'cette semaine', de:'diese Woche', es:'esta semana' },
  'dash.last_login':        { it:'Accesso:', en:'Last login:', fr:'Connexion:', de:'Anmeldung:', es:'Acceso:' },

  /* ─────────────────────────────────────────
     STATO FOUNDER (Dashboard card)
  ───────────────────────────────────────── */
  'founder.role_label':       { it:'Ruolo', en:'Role', fr:'Rôle', de:'Rolle', es:'Rol' },
  'founder.role_team':        { it:'Team LuxHaven360', en:'Team LuxHaven360', fr:'Équipe LuxHaven360', de:'Team LuxHaven360', es:'Equipo LuxHaven360' },
  'founder.access_label':     { it:'Accesso', en:'Access', fr:'Accès', de:'Zugang', es:'Acceso' },
  'founder.access_full':      { it:'Completo · Admin', en:'Full · Admin', fr:'Complet · Admin', de:'Vollständig · Admin', es:'Completo · Admin' },
  'founder.perms_label':      { it:'Permessi', en:'Permissions', fr:'Autorisations', de:'Berechtigungen', es:'Permisos' },
  'founder.perms_all':        { it:'Tutti i pannelli', en:'All panels', fr:'Tous les panneaux', de:'Alle Bereiche', es:'Todos los paneles' },
  'founder.level_label':      { it:'Livello', en:'Level', fr:'Niveau', de:'Ebene', es:'Nivel' },
  'founder.level_founding':   { it:'Founding Member', en:'Founding Member', fr:'Membre Fondateur', de:'Gründungsmitglied', es:'Miembro Fundador' },
  'founder.status_label':     { it:'Status', en:'Status', fr:'Statut', de:'Status', es:'Estado' },
  'founder.status_confirmed': { it:'Permanente · Confermato', en:'Permanent · Confirmed', fr:'Permanent · Confirmé', de:'Permanent · Bestätigt', es:'Permanente · Confirmado' },
  'founder.position_label':   { it:'Posizione', en:'Position', fr:'Position', de:'Position', es:'Posición' },
  'founder.benefits':         { it:['Accesso prioritario listing','Canale diretto team','Prenotazioni anticipate','Area Founder dedicata','Status permanente'], en:['Priority listing access','Direct team channel','Early bookings','Dedicated Founder area','Permanent status'], fr:['Accès prioritaire aux annonces','Canal direct équipe','Réservations anticipées','Espace Fondateur dédié','Statut permanent'], de:['Prioritätszugang zu Listings','Direktkanal zum Team','Frühbuchungen','Dedizierter Gründerbereich','Permanenter Status'], es:['Acceso prioritario a anuncios','Canal directo con el equipo','Reservas anticipadas','Área Fundador dedicada','Estatus permanente'] },
  'founder.current_level':    { it:'Livello Attuale', en:'Current Level', fr:'Niveau Actuel', de:'Aktuelles Level', es:'Nivel Actual' },
  'founder.next_level':       { it:'Prossimo Livello', en:'Next Level', fr:'Prochain Niveau', de:'Nächstes Level', es:'Siguiente Nivel' },
  'founder.level_next_value': { it:'Founding Member', en:'Founding Member', fr:'Membre Fondateur', de:'Gründungsmitglied', es:'Miembro Fundador' },
  'founder.available_spots':  { it:'Posti Disponibili', en:'Available Slots', fr:'Places Disponibles', de:'Verfügbare Plätze', es:'Plazas Disponibles' },
  'founder.progress_label':   { it:'Progressione verso Founding Member', en:'Progress towards Founding Member', fr:'Progression vers Membre Fondateur', de:'Fortschritt zum Gründungsmitglied', es:'Progreso hacia Miembro Fundador' },
  'founder.progress_pct':     { it:'45% completato · Conferma accesso per sbloccare i benefici Founding Member', en:'45% completed · Confirm access to unlock Founding Member benefits', fr:'45% complété · Confirmez l\'accès pour débloquer les avantages Membre Fondateur', de:'45% abgeschlossen · Zugang bestätigen, um Gründungsmitglied-Vorteile freizuschalten', es:'45% completado · Confirma el acceso para desbloquear los beneficios de Miembro Fundador' },
  'founder.upgrade_btn':      { it:'Richiedi Upgrade a Founding Member', en:'Request Founding Member Upgrade', fr:'Demander le Passage Membre Fondateur', de:'Upgrade zum Gründungsmitglied anfragen', es:'Solicitar Upgrade a Miembro Fundador' },
  'founder.candidate_level':  { it:'Founder Candidate', en:'Founder Candidate', fr:'Candidat Fondateur', de:'Gründungskandidat', es:'Candidato Fundador' },
  'founder.remaining_spots':  { it:'{n} rimasto', en:'{n} remaining', fr:'{n} restante', de:'{n} verbleibend', es:'{n} restante' },
  'founder.remaining_spots_p':{ it:'{n} rimasti', en:'{n} remaining', fr:'{n} restants', de:'{n} verbleibend', es:'{n} restantes' },

  /* ─────────────────────────────────────────
     FEED AGGIORNAMENTI
  ───────────────────────────────────────── */
  'feed.title':             { it:'Feed Aggiornamenti', en:'Updates Feed', fr:'Fil d\'Actualités', de:'Neuigkeiten-Feed', es:'Feed de Actualizaciones' },
  'feed.desc':              { it:'Novità, annunci e aggiornamenti esclusivi dal team LuxHaven360.', en:'News, announcements and exclusive updates from the LuxHaven360 team.', fr:'Actualités, annonces et mises à jour exclusives de l\'équipe LuxHaven360.', de:'Neuigkeiten, Ankündigungen und exklusive Updates vom LuxHaven360-Team.', es:'Noticias, anuncios y actualizaciones exclusivas del equipo LuxHaven360.' },
  'feed.publish':           { it:'+ Pubblica', en:'+ Publish', fr:'+ Publier', de:'+ Veröffentlichen', es:'+ Publicar' },
  'feed.tag_update':        { it:'📢 Aggiornamento', en:'📢 Update', fr:'📢 Mise à jour', de:'📢 Aktualisierung', es:'📢 Actualización' },
  'feed.tag_exclusive':     { it:'⭐ Contenuto Esclusivo', en:'⭐ Exclusive Content', fr:'⭐ Contenu Exclusif', de:'⭐ Exklusiver Inhalt', es:'⭐ Contenido Exclusivo' },
  'feed.tag_event':         { it:'📅 Evento', en:'📅 Event', fr:'📅 Événement', de:'📅 Veranstaltung', es:'📅 Evento' },
  'feed.tag_news':          { it:'📰 Notizia', en:'📰 News', fr:'📰 Actualité', de:'📰 Neuigkeit', es:'📰 Noticia' },
  'feed.like':              { it:'Mi piace', en:'Like', fr:'J\'aime', de:'Gefällt mir', es:'Me gusta' },
  'feed.liked':             { it:'Liked', en:'Liked', fr:'Aimé', de:'Gefällt', es:'Gustado' },
  'feed.comment':           { it:'Commenta', en:'Comment', fr:'Commenter', de:'Kommentieren', es:'Comentar' },
  'feed.share':             { it:'Condividi', en:'Share', fr:'Partager', de:'Teilen', es:'Compartir' },
  'feed.report':            { it:'Segnala', en:'Report', fr:'Signaler', de:'Melden', es:'Reportar' },
  'feed.report_comment':    { it:'🚩 Segnala', en:'🚩 Report', fr:'🚩 Signaler', de:'🚩 Melden', es:'🚩 Reportar' },
  'feed.locked_msg':        { it:"Questo contenuto è riservato ai <strong style='color:var(--gold)'>Founding Members</strong>. Effettua l'upgrade per accedere.", en:"This content is reserved for <strong style='color:var(--gold)'>Founding Members</strong>. Upgrade to access.", fr:"Ce contenu est réservé aux <strong style='color:var(--gold)'>Membres Fondateurs</strong>. Effectuez une mise à niveau pour y accéder.", de:"Dieser Inhalt ist für <strong style='color:var(--gold)'>Gründungsmitglieder</strong> reserviert. Führen Sie ein Upgrade durch, um Zugang zu erhalten.", es:"Este contenido está reservado para <strong style='color:var(--gold)'>Miembros Fundadores</strong>. Actualiza para acceder." },
  'feed.unlock_btn':        { it:'Sblocca come Founding Member', en:'Unlock as Founding Member', fr:'Débloquer en tant que Membre Fondateur', de:'Als Gründungsmitglied freischalten', es:'Desbloquear como Miembro Fundador' },
  'feed.comment_placeholder':{ it:'Scrivi un commento…', en:'Write a comment…', fr:'Écrire un commentaire…', de:'Kommentar schreiben…', es:'Escribe un comentario…' },

  /* ─────────────────────────────────────────
     DISCUSSIONI
  ───────────────────────────────────────── */
  'disc.title':             { it:'Discussioni', en:'Discussions', fr:'Discussions', de:'Diskussionen', es:'Discusiones' },
  'disc.desc':              { it:'Partecipa alle conversazioni della Community.', en:'Join the Community conversations.', fr:'Participez aux conversations de la Communauté.', de:'Nehmen Sie an Community-Gesprächen teil.', es:'Participa en las conversaciones de la Comunidad.' },
  'disc.new_thread':        { it:'+ Nuovo Thread', en:'+ New Thread', fr:'+ Nouveau Fil', de:'+ Neuer Thread', es:'+ Nuevo Hilo' },
  'disc.tab_all':           { it:'Tutti', en:'All', fr:'Tous', de:'Alle', es:'Todos' },
  'disc.tab_feedback':      { it:'Feedback', en:'Feedback', fr:'Retours', de:'Feedback', es:'Opiniones' },
  'disc.tab_questions':     { it:'Domande', en:'Questions', fr:'Questions', de:'Fragen', es:'Preguntas' },
  'disc.tab_ideas':         { it:'Idee', en:'Ideas', fr:'Idées', de:'Ideen', es:'Ideas' },
  'disc.tab_general':       { it:'Generali', en:'General', fr:'Général', de:'Allgemein', es:'General' },
  'disc.no_reply':          { it:'Nessuna risposta ancora', en:'No replies yet', fr:'Pas encore de réponse', de:'Noch keine Antworten', es:'Sin respuestas aún' },
  'disc.views':             { it:'visualizzazione', en:'view', fr:'vue', de:'Aufruf', es:'vista' },
  'disc.views_p':           { it:'visualizzazioni', en:'views', fr:'vues', de:'Aufrufe', es:'vistas' },
  'disc.replies':           { it:'risposta', en:'reply', fr:'réponse', de:'Antwort', es:'respuesta' },
  'disc.replies_p':         { it:'risposte', en:'replies', fr:'réponses', de:'Antworten', es:'respuestas' },
  'disc.no_threads':        { it:'Nessun thread disponibile in questa categoria.', en:'No threads available in this category.', fr:'Aucun fil disponible dans cette catégorie.', de:'Keine Threads in dieser Kategorie verfügbar.', es:'No hay hilos disponibles en esta categoría.' },
  'disc.back':              { it:'Torna alle discussioni', en:'Back to discussions', fr:'Retour aux discussions', de:'Zurück zu den Diskussionen', es:'Volver a las discusiones' },
  'disc.your_reply':        { it:'La tua risposta', en:'Your reply', fr:'Votre réponse', de:'Ihre Antwort', es:'Tu respuesta' },
  'disc.reply_placeholder': { it:'Scrivi la tua risposta…', en:'Write your reply…', fr:'Écrivez votre réponse…', de:'Schreiben Sie Ihre Antwort…', es:'Escribe tu respuesta…' },

  /* ─────────────────────────────────────────
     MESSAGGI
  ───────────────────────────────────────── */
  'msg.title':              { it:'Messaggi', en:'Messages', fr:'Messages', de:'Nachrichten', es:'Mensajes' },
  'msg.search_placeholder': { it:'Cerca conversazioni…', en:'Search conversations…', fr:'Rechercher des conversations…', de:'Gespräche suchen…', es:'Buscar conversaciones…' },
  'msg.select_conv':        { it:'Seleziona una conversazione', en:'Select a conversation', fr:'Sélectionnez une conversation', de:'Gespräch auswählen', es:'Selecciona una conversación' },
  'msg.delete_history':     { it:'Elimina cronologia per me', en:'Delete history for me', fr:'Supprimer l\'historique pour moi', de:'Verlauf für mich löschen', es:'Eliminar historial para mí' },
  'msg.type_placeholder':   { it:'Scrivi un messaggio…', en:'Write a message…', fr:'Écrivez un message…', de:'Nachricht schreiben…', es:'Escribe un mensaje…' },
  'msg.attach':             { it:'Allega file', en:'Attach file', fr:'Joindre un fichier', de:'Datei anhängen', es:'Adjuntar archivo' },
  'msg.emoji':              { it:'Emoji', en:'Emoji', fr:'Emoji', de:'Emoji', es:'Emoji' },
  'msg.remove':             { it:'Rimuovi', en:'Remove', fr:'Supprimer', de:'Entfernen', es:'Eliminar' },
  'msg.emoji_search':       { it:'Cerca emoji…', en:'Search emoji…', fr:'Rechercher un emoji…', de:'Emoji suchen…', es:'Buscar emoji…' },
  'msg.no_messages':        { it:'Nessun messaggio ancora.\nInizia la conversazione!', en:'No messages yet.\nStart the conversation!', fr:'Aucun message pour l\'instant.\nCommencez la conversation!', de:'Noch keine Nachrichten.\nStarten Sie das Gespräch!', es:'Sin mensajes todavía.\n¡Inicia la conversación!' },
  'msg.send':               { it:'Invia messaggio', en:'Send message', fr:'Envoyer le message', de:'Nachricht senden', es:'Enviar mensaje' },
  'msg.emoji_recent':       { it:'Recenti', en:'Recent', fr:'Récents', de:'Zuletzt verwendet', es:'Recientes' },
  'msg.emoji_smileys':      { it:'Faccine', en:'Smileys', fr:'Émoticônes', de:'Smileys', es:'Caritas' },
  'msg.emoji_people':       { it:'Persone', en:'People', fr:'Personnes', de:'Personen', es:'Personas' },
  'msg.emoji_hearts':       { it:'Cuori', en:'Hearts', fr:'Coeurs', de:'Herzen', es:'Corazones' },
  'msg.emoji_nature':       { it:'Natura', en:'Nature', fr:'Nature', de:'Natur', es:'Naturaleza' },
  'msg.emoji_food':         { it:'Cibo', en:'Food', fr:'Nourriture', de:'Essen', es:'Comida' },
  'msg.emoji_activities':   { it:'Attività', en:'Activities', fr:'Activités', de:'Aktivitäten', es:'Actividades' },
  'msg.emoji_travel':       { it:'Viaggi', en:'Travel', fr:'Voyages', de:'Reisen', es:'Viajes' },
  'msg.emoji_objects':      { it:'Oggetti', en:'Objects', fr:'Objets', de:'Objekte', es:'Objetos' },
  'msg.emoji_symbols':      { it:'Simboli', en:'Symbols', fr:'Symboles', de:'Symbole', es:'Símbolos' },
  'msg.emoji_flags':        { it:'Bandiere', en:'Flags', fr:'Drapeaux', de:'Flaggen', es:'Banderas' },
  'msg.emoji_no_recent':    { it:'Nessuna emoji usata di recente', en:'No recently used emoji', fr:'Aucun emoji récemment utilisé', de:'Keine kürzlich verwendeten Emoji', es:'Sin emoji usados recientemente' },
  'msg.emoji_no_results':   { it:'Nessun risultato per', en:'No results for', fr:'Aucun résultat pour', de:'Keine Ergebnisse für', es:'Sin resultados para' },

  /* ─────────────────────────────────────────
     LISTING
  ───────────────────────────────────────── */
  'listings.title':         { it:'Listing Esclusivi', en:'Exclusive Listings', fr:'Annonces Exclusives', de:'Exklusive Angebote', es:'Anuncios Exclusivos' },
  'listings.desc':          { it:'Accesso anticipato alle proprietà disponibili prima del lancio pubblico.', en:'Early access to available properties before public launch.', fr:'Accès anticipé aux propriétés disponibles avant le lancement public.', de:'Frühzeitiger Zugang zu verfügbaren Immobilien vor dem öffentlichen Launch.', es:'Acceso anticipado a las propiedades disponibles antes del lanzamiento público.' },
  'listings.book_btn':      { it:'Prenota Accesso Prioritario', en:'Book Priority Access', fr:'Réserver l\'Accès Prioritaire', de:'Prioritätszugang buchen', es:'Reservar Acceso Prioritario' },
  'listings.locked_msg':    { it:'Contenuto riservato ai Founding Members', en:'Content reserved for Founding Members', fr:'Contenu réservé aux Membres Fondateurs', de:'Inhalt für Gründungsmitglieder reserviert', es:'Contenido reservado para Miembros Fundadores' },
  'listings.no_listings':   { it:'Nessun listing disponibile al momento.', en:'No listings available at the moment.', fr:'Aucune annonce disponible pour le moment.', de:'Derzeit keine Angebote verfügbar.', es:'No hay anuncios disponibles por el momento.' },

  /* ─────────────────────────────────────────
     SONDAGGI
  ───────────────────────────────────────── */
  'surveys.title':          { it:'Sondaggi & Feedback', en:'Surveys & Feedback', fr:'Sondages & Retours', de:'Umfragen & Feedback', es:'Encuestas & Feedback' },
  'surveys.desc':           { it:'La tua voce contribuisce direttamente allo sviluppo del progetto.', en:'Your voice directly contributes to the development of the project.', fr:'Votre voix contribue directement au développement du projet.', de:'Ihre Stimme trägt direkt zur Projektentwicklung bei.', es:'Tu voz contribuye directamente al desarrollo del proyecto.' },
  'surveys.vote_btn':       { it:'Vota', en:'Vote', fr:'Voter', de:'Abstimmen', es:'Votar' },
  'surveys.voted':          { it:'Hai votato', en:'You voted', fr:'Vous avez voté', de:'Sie haben abgestimmt', es:'Has votado' },
  'surveys.total_votes':    { it:'voto totale', en:'total vote', fr:'vote total', de:'Gesamtstimme', es:'voto total' },
  'surveys.total_votes_p':  { it:'voti totali', en:'total votes', fr:'votes totaux', de:'Gesamtstimmen', es:'votos totales' },
  'surveys.no_surveys':     { it:'Nessun sondaggio disponibile.', en:'No surveys available.', fr:'Aucun sondage disponible.', de:'Keine Umfragen verfügbar.', es:'No hay encuestas disponibles.' },
  'surveys.expires':        { it:'Scade', en:'Expires', fr:'Expire', de:'Läuft ab', es:'Caduca' },
  'surveys.expired':        { it:'Scaduto', en:'Expired', fr:'Expiré', de:'Abgelaufen', es:'Caducado' },

  /* ─────────────────────────────────────────
     NOTIFICHE
  ───────────────────────────────────────── */
  'notif.title':            { it:'Centro Notifiche', en:'Notification Center', fr:'Centre de Notifications', de:'Benachrichtigungszentrum', es:'Centro de Notificaciones' },
  'notif.mark_all':         { it:'Segna tutte come lette', en:'Mark all as read', fr:'Tout marquer comme lu', de:'Alle als gelesen markieren', es:'Marcar todas como leídas' },
  'notif.no_notifs':        { it:'Nessuna notifica.', en:'No notifications.', fr:'Aucune notification.', de:'Keine Benachrichtigungen.', es:'Sin notificaciones.' },
  'notif.popup_label':      { it:'Notifica', en:'Notification', fr:'Notification', de:'Benachrichtigung', es:'Notificación' },

  /* ─────────────────────────────────────────
     GESTIONE MEMBRI (Admin)
  ───────────────────────────────────────── */
  'members.title':          { it:'Gestione Membri', en:'Member Management', fr:'Gestion des Membres', de:'Mitgliederverwaltung', es:'Gestión de Miembros' },
  'members.desc':           { it:'Dati in tempo reale · aggiornamento automatico ogni 15 secondi.', en:'Real-time data · automatic update every 15 seconds.', fr:'Données en temps réel · mise à jour automatique toutes les 15 secondes.', de:'Echtzeitdaten · automatische Aktualisierung alle 15 Sekunden.', es:'Datos en tiempo real · actualización automática cada 15 segundos.' },
  'members.updating':       { it:'Aggiornamento…', en:'Updating…', fr:'Mise à jour…', de:'Aktualisierung…', es:'Actualizando…' },
  'members.search_ph':      { it:'Cerca membro…', en:'Search member…', fr:'Rechercher un membre…', de:'Mitglied suchen…', es:'Buscar miembro…' },
  'members.tab_all':        { it:'Tutti', en:'All', fr:'Tous', de:'Alle', es:'Todos' },
  'members.tab_founding':   { it:'Founding Members', en:'Founding Members', fr:'Membres Fondateurs', de:'Gründungsmitglieder', es:'Miembros Fundadores' },
  'members.tab_candidates': { it:'Candidates', en:'Candidates', fr:'Candidats', de:'Kandidaten', es:'Candidatos' },
  'members.col_member':     { it:'Membro', en:'Member', fr:'Membre', de:'Mitglied', es:'Miembro' },
  'members.col_level':      { it:'Livello', en:'Level', fr:'Niveau', de:'Ebene', es:'Nivel' },
  'members.col_joined':     { it:'Iscritto il', en:'Joined', fr:'Inscrit le', de:'Beigetreten am', es:'Inscrito el' },
  'members.col_last':       { it:'Ultima Attività', en:'Last Activity', fr:'Dernière Activité', de:'Letzte Aktivität', es:'Última Actividad' },
  'members.col_status':     { it:'Stato', en:'Status', fr:'Statut', de:'Status', es:'Estado' },
  'members.col_actions':    { it:'Azioni', en:'Actions', fr:'Actions', de:'Aktionen', es:'Acciones' },
  'members.not_found':      { it:'Nessun membro trovato.', en:'No member found.', fr:'Aucun membre trouvé.', de:'Kein Mitglied gefunden.', es:'No se encontraron miembros.' },
  'members.btn_promote':    { it:'Promuovi', en:'Promote', fr:'Promouvoir', de:'Befördern', es:'Promover' },
  'members.btn_demote':     { it:'Retrocedi', en:'Demote', fr:'Rétrograder', de:'Herabstufen', es:'Degradar' },
  'members.btn_message':    { it:'Messaggio', en:'Message', fr:'Message', de:'Nachricht', es:'Mensaje' },
  'members.btn_warn':       { it:'Avviso', en:'Warn', fr:'Avertir', de:'Warnen', es:'Advertir' },
  'members.status_online':  { it:'Online', en:'Online', fr:'En ligne', de:'Online', es:'En línea' },
  'members.status_away':    { it:'Assente', en:'Away', fr:'Absent', de:'Abwesend', es:'Ausente' },
  'members.status_offline': { it:'Offline', en:'Offline', fr:'Hors ligne', de:'Offline', es:'Desconectado' },

  /* ─────────────────────────────────────────
     COMUNICAZIONI / BROADCAST (Admin)
  ───────────────────────────────────────── */
  'broadcast.title':        { it:'Comunicazioni', en:'Communications', fr:'Communications', de:'Kommunikation', es:'Comunicaciones' },
  'broadcast.desc':         { it:'Pubblica aggiornamenti e comunicati per i membri della Community.', en:'Publish updates and announcements for Community members.', fr:'Publiez des mises à jour et des annonces pour les membres de la Communauté.', de:'Aktualisierungen und Ankündigungen für Community-Mitglieder veröffentlichen.', es:'Publica actualizaciones y comunicados para los miembros de la Comunidad.' },
  'broadcast.recipients':   { it:'Destinatari', en:'Recipients', fr:'Destinataires', de:'Empfänger', es:'Destinatarios' },
  'broadcast.all_members':  { it:'Tutti i membri', en:'All members', fr:'Tous les membres', de:'Alle Mitglieder', es:'Todos los miembros' },
  'broadcast.founding':     { it:'Founding Members', en:'Founding Members', fr:'Membres Fondateurs', de:'Gründungsmitglieder', es:'Miembros Fundadores' },
  'broadcast.candidates':   { it:'Founder Candidates', en:'Founder Candidates', fr:'Candidats Fondateurs', de:'Gründungskandidaten', es:'Candidatos Fundadores' },
  'broadcast.type_label':   { it:'Tipo di comunicazione', en:'Communication type', fr:'Type de communication', de:'Kommunikationstyp', es:'Tipo de comunicación' },
  'broadcast.type_update':  { it:'Aggiornamento Progetto', en:'Project Update', fr:'Mise à jour Projet', de:'Projektaktualisierung', es:'Actualización de Proyecto' },
  'broadcast.type_news':    { it:'Annuncio', en:'Announcement', fr:'Annonce', de:'Ankündigung', es:'Anuncio' },
  'broadcast.type_exclusive':{ it:'Contenuto Esclusivo', en:'Exclusive Content', fr:'Contenu Exclusif', de:'Exklusiver Inhalt', es:'Contenido Exclusivo' },
  'broadcast.type_event':   { it:'Evento', en:'Event', fr:'Événement', de:'Veranstaltung', es:'Evento' },
  'broadcast.title_field':  { it:'Titolo', en:'Title', fr:'Titre', de:'Titel', es:'Título' },
  'broadcast.title_ph':     { it:'Titolo della comunicazione…', en:'Communication title…', fr:'Titre de la communication…', de:'Kommunikationstitel…', es:'Título de la comunicación…' },
  'broadcast.content_field':{ it:'Contenuto', en:'Content', fr:'Contenu', de:'Inhalt', es:'Contenido' },
  'broadcast.content_ph':   { it:'Scrivi il contenuto della comunicazione…', en:'Write the communication content…', fr:'Rédigez le contenu de la communication…', de:'Kommunikationsinhalt schreiben…', es:'Escribe el contenido de la comunicación…' },
  'broadcast.schedule':     { it:'Programma invio', en:'Schedule send', fr:'Planifier l\'envoi', de:'Versand planen', es:'Programar envío' },
  'broadcast.immediate':    { it:'Immediato', en:'Immediate', fr:'Immédiat', de:'Sofort', es:'Inmediato' },
  'broadcast.planned':      { it:'Pianificato', en:'Scheduled', fr:'Planifié', de:'Geplant', es:'Programado' },
  'broadcast.preview_btn':  { it:'Anteprima', en:'Preview', fr:'Aperçu', de:'Vorschau', es:'Vista previa' },
  'broadcast.publish_btn':  { it:'Pubblica Ora', en:'Publish Now', fr:'Publier Maintenant', de:'Jetzt veröffentlichen', es:'Publicar ahora' },

  /* ─────────────────────────────────────────
     GESTIONE EVENTI (Admin)
  ───────────────────────────────────────── */
  'events.title':           { it:'Gestione Eventi', en:'Event Management', fr:'Gestion des Événements', de:'Veranstaltungsverwaltung', es:'Gestión de Eventos' },
  'events.desc':            { it:'Crea e gestisci gli eventi nella sezione "Prossimi Eventi" del pannello laterale.', en:'Create and manage events in the "Upcoming Events" section of the side panel.', fr:'Créez et gérez les événements dans la section "Événements à venir" du panneau latéral.', de:'Erstellen und verwalten Sie Veranstaltungen im Bereich "Bevorstehende Events" des Seitenpanels.', es:'Crea y gestiona los eventos en la sección "Próximos Eventos" del panel lateral.' },
  'events.title_field':     { it:'Titolo Evento *', en:'Event Title *', fr:'Titre Événement *', de:'Veranstaltungstitel *', es:'Título del Evento *' },
  'events.datetime':        { it:'Data e Ora *', en:'Date & Time *', fr:'Date et Heure *', de:'Datum & Uhrzeit *', es:'Fecha y Hora *' },
  'events.time_str':        { it:'Orario (testo)', en:'Time (text)', fr:'Horaire (texte)', de:'Uhrzeit (Text)', es:'Horario (texto)' },
  'events.time_ph':         { it:'es. Ore 18:00', en:'e.g. 6:00 PM', fr:'ex. 18h00', de:'z.B. 18:00 Uhr', es:'ej. 18:00 h' },
  'events.note':            { it:'Nota / Accesso', en:'Note / Access', fr:'Note / Accès', de:'Hinweis / Zugang', es:'Nota / Acceso' },
  'events.note_ph':         { it:'es. Solo Founding Members · Accesso prioritario', en:'e.g. Founding Members only · Priority access', fr:'ex. Membres Fondateurs uniquement · Accès prioritaire', de:'z.B. Nur Gründungsmitglieder · Prioritätszugang', es:'ej. Solo Miembros Fundadores · Acceso prioritario' },
  'events.create_btn':      { it:'＋ Crea Evento', en:'＋ Create Event', fr:'＋ Créer Événement', de:'＋ Veranstaltung erstellen', es:'＋ Crear Evento' },
  'events.title_ph':        { it:'es. Q&A Esclusiva — Founding Members', en:'e.g. Exclusive Q&A — Founding Members', fr:'ex. Q&R Exclusif — Membres Fondateurs', de:'z.B. Exklusives Q&A — Gründungsmitglieder', es:'ej. Q&A Exclusivo — Miembros Fundadores' },

  /* ─────────────────────────────────────────
     CREA SONDAGGIO (Admin)
  ───────────────────────────────────────── */
  'survey_create.title':    { it:'📊 Crea Sondaggio', en:'📊 Create Survey', fr:'📊 Créer Sondage', de:'📊 Umfrage erstellen', es:'📊 Crear Encuesta' },
  'survey_create.desc':     { it:'Pubblica un sondaggio per raccogliere feedback dalla community.', en:'Publish a survey to collect feedback from the community.', fr:'Publiez un sondage pour recueillir des retours de la communauté.', de:'Veröffentlichen Sie eine Umfrage, um Feedback aus der Community zu sammeln.', es:'Publica una encuesta para recopilar opiniones de la comunidad.' },
  'survey_create.title_f':  { it:'Titolo Sondaggio', en:'Survey Title', fr:'Titre du Sondage', de:'Umfragetitel', es:'Título de la Encuesta' },
  'survey_create.title_ph': { it:"es. Qual è la tua preferenza per il design?", en:"e.g. What is your design preference?", fr:"ex. Quelle est votre préférence de design?", de:"z.B. Was ist Ihre Designpräferenz?", es:"ej. ¿Cuál es tu preferencia de diseño?" },
  'survey_create.question': { it:'Domanda', en:'Question', fr:'Question', de:'Frage', es:'Pregunta' },
  'survey_create.quest_ph': { it:'Scrivi la domanda del sondaggio…', en:'Write the survey question…', fr:'Rédigez la question du sondage…', de:'Umfragefrage schreiben…', es:'Escribe la pregunta de la encuesta…' },
  'survey_create.options':  { it:'Opzioni di risposta', en:'Answer options', fr:'Options de réponse', de:'Antwortmöglichkeiten', es:'Opciones de respuesta' },
  'survey_create.option1':  { it:'Opzione 1', en:'Option 1', fr:'Option 1', de:'Option 1', es:'Opción 1' },
  'survey_create.option2':  { it:'Opzione 2', en:'Option 2', fr:'Option 2', de:'Option 2', es:'Opción 2' },
  'survey_create.add_opt':  { it:'+ Aggiungi opzione', en:'+ Add option', fr:'+ Ajouter une option', de:'+ Option hinzufügen', es:'+ Agregar opción' },
  'survey_create.expiry':   { it:'Scadenza (opzionale)', en:'Expiry (optional)', fr:'Expiration (optionnel)', de:'Ablauf (optional)', es:'Vencimiento (opcional)' },
  'survey_create.publish':  { it:'Pubblica Sondaggio', en:'Publish Survey', fr:'Publier le Sondage', de:'Umfrage veröffentlichen', es:'Publicar Encuesta' },

  /* ─────────────────────────────────────────
     CREA LISTING (Admin)
  ───────────────────────────────────────── */
  'listing_create.title':   { it:'🏷️ Crea Listing', en:'🏷️ Create Listing', fr:'🏷️ Créer Annonce', de:'🏷️ Angebot erstellen', es:'🏷️ Crear Anuncio' },
  'listing_create.desc':    { it:'Pubblica un annuncio di prodotto o servizio esclusivo LuxHaven.', en:'Publish an exclusive LuxHaven product or service listing.', fr:'Publiez une annonce de produit ou service exclusif LuxHaven.', de:'Exklusives LuxHaven-Produkt oder -Dienstleistungsangebot veröffentlichen.', es:'Publica un anuncio de producto o servicio exclusivo LuxHaven.' },
  'listing_create.cat':     { it:'Categoria', en:'Category', fr:'Catégorie', de:'Kategorie', es:'Categoría' },
  'listing_create.cat_re':  { it:'🏠 Immobili', en:'🏠 Real Estate', fr:'🏠 Immobilier', de:'🏠 Immobilien', es:'🏠 Inmuebles' },
  'listing_create.cat_sc':  { it:'🏎️ Supercar', en:'🏎️ Supercar', fr:'🏎️ Supercar', de:'🏎️ Supercar', es:'🏎️ Supercar' },
  'listing_create.cat_exp': { it:'✨ Esperienze', en:'✨ Experiences', fr:'✨ Expériences', de:'✨ Erlebnisse', es:'✨ Experiencias' },
  'listing_create.cat_sh':  { it:'🛍️ Shop', en:'🛍️ Shop', fr:'🛍️ Boutique', de:'🛍️ Shop', es:'🛍️ Tienda' },
  'listing_create.cat_td':  { it:'🚗 Test Drive', en:'🚗 Test Drive', fr:'🚗 Essai routier', de:'🚗 Probefahrt', es:'🚗 Prueba de conducción' },
  'listing_create.cat_sv':  { it:'💎 Pacchetti', en:'💎 Packages', fr:'💎 Forfaits', de:'💎 Pakete', es:'💎 Paquetes' },
  'listing_create.title_f': { it:'Titolo Listing', en:'Listing Title', fr:'Titre de l\'Annonce', de:'Angebotstitel', es:'Título del Anuncio' },
  'listing_create.title_ph':{ it:'es. Villa esclusiva a Portofino', en:'e.g. Exclusive villa in Portofino', fr:'ex. Villa exclusive à Portofino', de:'z.B. Exklusive Villa in Portofino', es:'ej. Villa exclusiva en Portofino' },
  'listing_create.desc_f':  { it:'Descrizione', en:'Description', fr:'Description', de:'Beschreibung', es:'Descripción' },
  'listing_create.desc_ph': { it:'Descrivi il prodotto o servizio…', en:'Describe the product or service…', fr:'Décrivez le produit ou service…', de:'Produkt oder Dienstleistung beschreiben…', es:'Describe el producto o servicio…' },
  'listing_create.price_f': { it:'Prezzo / Dettaglio (opzionale)', en:'Price / Detail (optional)', fr:'Prix / Détail (optionnel)', de:'Preis / Detail (optional)', es:'Precio / Detalle (opcional)' },
  'listing_create.price_ph':{ it:"es. €2.500.000 · Disponibile subito", en:"e.g. €2,500,000 · Available immediately", fr:"ex. 2 500 000 € · Disponible immédiatement", de:"z.B. 2.500.000 € · Sofort verfügbar", es:"ej. 2.500.000 € · Disponible de inmediato" },
  'listing_create.thumb':   { it:'Miniatura (opzionale)', en:'Thumbnail (optional)', fr:'Miniature (optionnel)', de:'Vorschaubild (optional)', es:'Miniatura (opcional)' },
  'listing_create.upload':  { it:'Carica immagine', en:'Upload image', fr:'Télécharger une image', de:'Bild hochladen', es:'Subir imagen' },
  'listing_create.no_file': { it:'Nessun file selezionato', en:'No file selected', fr:'Aucun fichier sélectionné', de:'Keine Datei ausgewählt', es:'Ningún archivo seleccionado' },
  'listing_create.preview': { it:'👁 Anteprima', en:'👁 Preview', fr:'👁 Aperçu', de:'👁 Vorschau', es:'👁 Vista previa' },
  'listing_create.publish': { it:'Pubblica Listing', en:'Publish Listing', fr:'Publier l\'Annonce', de:'Angebot veröffentlichen', es:'Publicar Anuncio' },

  /* ─────────────────────────────────────────
     MODERAZIONE (Admin)
  ───────────────────────────────────────── */
  'mod.title':              { it:'Moderazione', en:'Moderation', fr:'Modération', de:'Moderation', es:'Moderación' },
  'mod.desc':               { it:"Gestisci segnalazioni e monitora l'attività della Community.", en:'Manage reports and monitor Community activity.', fr:'Gérez les signalements et surveillez l\'activité de la Communauté.', de:'Meldungen verwalten und Community-Aktivität überwachen.', es:'Gestiona informes y monitorea la actividad de la Comunidad.' },

  /* ─────────────────────────────────────────
     ANALYTICS (Admin)
  ───────────────────────────────────────── */
  'analytics.title':        { it:'Analytics', en:'Analytics', fr:'Analytique', de:'Analytik', es:'Analítica' },
  'analytics.desc':         { it:'Dati e metriche della Community in tempo reale.', en:'Real-time Community data and metrics.', fr:'Données et métriques de la Communauté en temps réel.', de:'Echtzeit-Daten und Metriken der Community.', es:'Datos y métricas de la Comunidad en tiempo real.' },
  'analytics.realtime':     { it:'Aggiornamento in tempo reale', en:'Real-time update', fr:'Mise à jour en temps réel', de:'Echtzeit-Aktualisierung', es:'Actualización en tiempo real' },
  'analytics.sessions':     { it:'Sessioni Oggi', en:'Sessions Today', fr:'Sessions Aujourd\'hui', de:'Sitzungen Heute', es:'Sesiones Hoy' },
  'analytics.messages_7d':  { it:'Messaggi (7gg)', en:'Messages (7d)', fr:'Messages (7j)', de:'Nachrichten (7T)', es:'Mensajes (7d)' },
  'analytics.engagement':   { it:'Engagement Rate', en:'Engagement Rate', fr:'Taux d\'Engagement', de:'Engagement-Rate', es:'Tasa de participación' },
  'analytics.total_posts':  { it:'Post Totali', en:'Total Posts', fr:'Posts Totaux', de:'Beiträge Gesamt', es:'Posts Totales' },
  'analytics.active_disc':  { it:'Discussioni Attive', en:'Active Discussions', fr:'Discussions Actives', de:'Aktive Diskussionen', es:'Discusiones Activas' },
  'analytics.open_reports': { it:'Segnalazioni Aperte', en:'Open Reports', fr:'Signalements Ouverts', de:'Offene Meldungen', es:'Informes Abiertos' },
  'analytics.weekly':       { it:'Attività Settimanale', en:'Weekly Activity', fr:'Activité Hebdomadaire', de:'Wöchentliche Aktivität', es:'Actividad Semanal' },
  'analytics.levels':       { it:'Distribuzione Livelli', en:'Level Distribution', fr:'Distribution des Niveaux', de:'Level-Verteilung', es:'Distribución de Niveles' },
  'analytics.days':         { it:['Lun','Mar','Mer','Gio','Ven','Sab','Dom'], en:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], fr:['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'], de:['Mo','Di','Mi','Do','Fr','Sa','So'], es:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'] },

  /* ─────────────────────────────────────────
     PANNELLO DESTRO
  ───────────────────────────────────────── */
  'rp.online_members':      { it:'Membri Online', en:'Online Members', fr:'Membres en Ligne', de:'Online-Mitglieder', es:'Miembros En Línea' },
  'rp.upcoming_events':     { it:'Prossimi Eventi', en:'Upcoming Events', fr:'Événements à Venir', de:'Bevorstehende Veranstaltungen', es:'Próximos Eventos' },
  'rp.project_status':      { it:'Stato Progetto', en:'Project Status', fr:'Statut du Projet', de:'Projektstatus', es:'Estado del Proyecto' },
  'rp.confirmed_spots':     { it:'Posti confermati', en:'Confirmed spots', fr:'Places confirmées', de:'Bestätigte Plätze', es:'Plazas confirmadas' },
  'rp.live':                { it:'In diretta', en:'Live', fr:'En direct', de:'Live', es:'En vivo' },
  'rp.no_events':           { it:'Nessun evento in programma.', en:'No events scheduled.', fr:'Aucun événement prévu.', de:'Keine Veranstaltungen geplant.', es:'No hay eventos programados.' },
  'rp.spots_remaining_s':   { it:'posto ancora disponibile', en:'spot still available', fr:'place encore disponible', de:'Platz noch verfügbar', es:'plaza aún disponible' },
  'rp.spots_remaining_p':   { it:'posti ancora disponibili', en:'spots still available', fr:'places encore disponibles', de:'Plätze noch verfügbar', es:'plazas aún disponibles' },

  /* ─────────────────────────────────────────
     MODAL — AVVISO UFFICIALE
  ───────────────────────────────────────── */
  'warn.title':             { it:'Invia Avviso Ufficiale', en:'Send Official Warning', fr:'Envoyer un Avertissement Officiel', de:'Offizielle Warnung senden', es:'Enviar Advertencia Oficial' },
  'warn.type_label':        { it:'Tipo di avviso', en:'Warning type', fr:'Type d\'avertissement', de:'Warnungstyp', es:'Tipo de advertencia' },
  'warn.type_behavior':     { it:'⚠️ Comportamento', en:'⚠️ Behavior', fr:'⚠️ Comportement', de:'⚠️ Verhalten', es:'⚠️ Comportamiento' },
  'warn.type_content':      { it:'📋 Contenuto', en:'📋 Content', fr:'📋 Contenu', de:'📋 Inhalt', es:'📋 Contenido' },
  'warn.type_recall':       { it:'📌 Richiamo Ufficiale', en:'📌 Official Recall', fr:'📌 Rappel Officiel', de:'📌 Offizielle Abmahnung', es:'📌 Aviso Oficial' },
  'warn.msg_label':         { it:'Messaggio avviso', en:'Warning message', fr:'Message d\'avertissement', de:'Warnungsnachricht', es:'Mensaje de advertencia' },
  'warn.msg_ph':            { it:'Scrivi il messaggio di avviso che verrà inviato al membro…', en:'Write the warning message that will be sent to the member…', fr:'Rédigez le message d\'avertissement qui sera envoyé au membre…', de:'Schreiben Sie die Warnungsnachricht, die an das Mitglied gesendet wird…', es:'Escribe el mensaje de advertencia que se enviará al miembro…' },
  'warn.cancel':            { it:'Annulla', en:'Cancel', fr:'Annuler', de:'Abbrechen', es:'Cancelar' },
  'warn.send_btn':          { it:'Invia Avviso', en:'Send Warning', fr:'Envoyer l\'Avertissement', de:'Warnung senden', es:'Enviar Advertencia' },
  'warn.sending':           { it:'Invio…', en:'Sending…', fr:'Envoi…', de:'Senden…', es:'Enviando…' },

  /* ─────────────────────────────────────────
     MODAL — BROADCAST PREVIEW
  ───────────────────────────────────────── */
  'bcast_preview.title':    { it:'Anteprima Comunicazione', en:'Communication Preview', fr:'Aperçu de la Communication', de:'Kommunikationsvorschau', es:'Vista Previa de Comunicación' },
  'bcast_preview.close':    { it:'✕ Chiudi Anteprima', en:'✕ Close Preview', fr:'✕ Fermer l\'Aperçu', de:'✕ Vorschau schließen', es:'✕ Cerrar Vista Previa' },
  'bcast_preview.notice':   { it:"👁 Questa è un'anteprima — la comunicazione non è ancora pubblicata", en:"👁 This is a preview — the communication has not been published yet", fr:"👁 Ceci est un aperçu — la communication n'est pas encore publiée", de:"👁 Dies ist eine Vorschau — die Mitteilung wurde noch nicht veröffentlicht", es:"👁 Esta es una vista previa — la comunicación aún no ha sido publicada" },

  /* ─────────────────────────────────────────
     MODAL — LISTING PREVIEW
  ───────────────────────────────────────── */
  'listing_preview.close':  { it:'✕ Chiudi', en:'✕ Close', fr:'✕ Fermer', de:'✕ Schließen', es:'✕ Cerrar' },
  'listing_preview.notice': { it:"Questa è un'anteprima — il listing non è ancora pubblicato", en:"This is a preview — the listing has not been published yet", fr:"Ceci est un aperçu — l'annonce n'est pas encore publiée", de:"Dies ist eine Vorschau — das Angebot wurde noch nicht veröffentlicht", es:"Esta es una vista previa — el anuncio aún no ha sido publicado" },
  'listing_preview.edit':   { it:'Modifica', en:'Edit', fr:'Modifier', de:'Bearbeiten', es:'Editar' },
  'listing_preview.publish':{ it:'Pubblica Ora', en:'Publish Now', fr:'Publier Maintenant', de:'Jetzt veröffentlichen', es:'Publicar Ahora' },

  /* ─────────────────────────────────────────
     MODAL — NUOVO THREAD
  ───────────────────────────────────────── */
  'thread_modal.title':     { it:'Nuovo Thread', en:'New Thread', fr:'Nouveau Fil', de:'Neuer Thread', es:'Nuevo Hilo' },
  'thread_modal.cat_label': { it:'Categoria', en:'Category', fr:'Catégorie', de:'Kategorie', es:'Categoría' },
  'thread_modal.general':   { it:'Generale', en:'General', fr:'Général', de:'Allgemein', es:'General' },
  'thread_modal.question':  { it:'Domanda', en:'Question', fr:'Question', de:'Frage', es:'Pregunta' },
  'thread_modal.feedback':  { it:'Feedback', en:'Feedback', fr:'Retour', de:'Feedback', es:'Opinión' },
  'thread_modal.idea':      { it:'Idea', en:'Idea', fr:'Idée', de:'Idee', es:'Idea' },
  'thread_modal.title_f':   { it:'Titolo del thread', en:'Thread title', fr:'Titre du fil', de:'Thread-Titel', es:'Título del hilo' },
  'thread_modal.title_ph':  { it:'Scrivi un titolo chiaro e descrittivo…', en:'Write a clear and descriptive title…', fr:'Rédigez un titre clair et descriptif…', de:'Klaren und beschreibenden Titel schreiben…', es:'Escribe un título claro y descriptivo…' },
  'thread_modal.body_f':    { it:'Messaggio iniziale', en:'Initial message', fr:'Message initial', de:'Erste Nachricht', es:'Mensaje inicial' },
  'thread_modal.body_ph':   { it:"Descrivi l'argomento, fai una domanda o condividi la tua idea…", en:'Describe the topic, ask a question or share your idea…', fr:'Décrivez le sujet, posez une question ou partagez votre idée…', de:'Thema beschreiben, eine Frage stellen oder Ihre Idee teilen…', es:'Describe el tema, haz una pregunta o comparte tu idea…' },
  'thread_modal.cancel':    { it:'Annulla', en:'Cancel', fr:'Annuler', de:'Abbrechen', es:'Cancelar' },
  'thread_modal.publish':   { it:'Pubblica Thread', en:'Publish Thread', fr:'Publier le Fil', de:'Thread veröffentlichen', es:'Publicar Hilo' },

  /* ─────────────────────────────────────────
     MODAL — ELIMINA CRONOLOGIA
  ───────────────────────────────────────── */
  'delete.title':           { it:'Elimina Cronologia', en:'Delete History', fr:'Supprimer l\'Historique', de:'Verlauf löschen', es:'Eliminar Historial' },
  'delete.desc_before':     { it:'Stai per eliminare tutti i messaggi con', en:'You are about to delete all messages with', fr:'Vous êtes sur le point de supprimer tous les messages avec', de:'Sie sind dabei, alle Nachrichten mit', es:'Estás a punto de eliminar todos los mensajes con' },
  'delete.desc_after':      { it:'per il tuo account.', en:'for your account.', fr:'pour votre compte.', de:'für Ihr Konto zu löschen.', es:'para tu cuenta.' },
  'delete.warning':         { it:"L'altro membro continuerà a vedere i propri messaggi. Questa azione è irreversibile.", en:"The other member will continue to see their messages. This action is irreversible.", fr:"L'autre membre continuera à voir ses messages. Cette action est irréversible.", de:"Das andere Mitglied wird seine Nachrichten weiterhin sehen können. Diese Aktion ist unumkehrbar.", es:"El otro miembro continuará viendo sus mensajes. Esta acción es irreversible." },
  'delete.cancel':          { it:'Annulla', en:'Cancel', fr:'Annuler', de:'Abbrechen', es:'Cancelar' },
  'delete.confirm':         { it:'Elimina tutto', en:'Delete all', fr:'Tout supprimer', de:'Alles löschen', es:'Eliminar todo' },
  'delete.in_progress':     { it:'Eliminazione in corso…', en:'Deletion in progress…', fr:'Suppression en cours…', de:'Löschvorgang läuft…', es:'Eliminación en progreso…' },
  'delete.preparing':       { it:'Preparazione', en:'Preparing', fr:'Préparation', de:'Vorbereitung', es:'Preparando' },
  'delete.step1':           { it:'Recupero messaggi', en:'Fetching messages', fr:'Récupération des messages', de:'Nachrichten abrufen', es:'Recuperando mensajes' },
  'delete.step2':           { it:'Eliminazione messaggi', en:'Deleting messages', fr:'Suppression des messages', de:'Nachrichten löschen', es:'Eliminando mensajes' },
  'delete.step3':           { it:'Aggiornamento conversazione', en:'Updating conversation', fr:'Mise à jour de la conversation', de:'Gespräch aktualisieren', es:'Actualizando conversación' },
  'delete.step4':           { it:'Sincronizzazione dati', en:'Syncing data', fr:'Synchronisation des données', de:'Daten synchronisieren', es:'Sincronizando datos' },
  'delete.step1_running':   { it:'Recupero messaggi…', en:'Fetching messages…', fr:'Récupération des messages…', de:'Nachrichten werden abgerufen…', es:'Recuperando mensajes…' },
  'delete.step2_running':   { it:'Rimozione messaggi…', en:'Removing messages…', fr:'Suppression des messages…', de:'Nachrichten werden entfernt…', es:'Eliminando mensajes…' },
  'delete.step3_running':   { it:'Aggiornamento conversazione…', en:'Updating conversation…', fr:'Mise à jour de la conversation…', de:'Gespräch wird aktualisiert…', es:'Actualizando conversación…' },
  'delete.step4_running':   { it:'Sincronizzazione…', en:'Syncing…', fr:'Synchronisation…', de:'Synchronisierung…', es:'Sincronizando…' },
  'delete.done_title':      { it:'Cronologia eliminata', en:'History deleted', fr:'Historique supprimé', de:'Verlauf gelöscht', es:'Historial eliminado' },
  'delete.done_sub':        { it:"I messaggi sono stati rimossi dal tuo account.\nL'altro membro non è stato influenzato.", en:"Messages have been removed from your account.\nThe other member was not affected.", fr:"Les messages ont été supprimés de votre compte.\nL'autre membre n'a pas été affecté.", de:"Nachrichten wurden aus Ihrem Konto entfernt.\nDas andere Mitglied wurde nicht beeinträchtigt.", es:"Los mensajes han sido eliminados de tu cuenta.\nEl otro miembro no se vio afectado." },

  /* ─────────────────────────────────────────
     PROFILO UTENTE
  ───────────────────────────────────────── */
  'profile.account_info':   { it:'Informazioni Account', en:'Account Information', fr:'Informations du Compte', de:'Kontoinformationen', es:'Información de la Cuenta' },
  'profile.email':          { it:'Email', en:'Email', fr:'E-mail', de:'E-Mail', es:'Correo electrónico' },
  'profile.level':          { it:'Livello', en:'Level', fr:'Niveau', de:'Ebene', es:'Nivel' },
  'profile.status_label':   { it:'Stato', en:'Status', fr:'Statut', de:'Status', es:'Estado' },
  'profile.status_value':   { it:'Attivo · Online', en:'Active · Online', fr:'Actif · En ligne', de:'Aktiv · Online', es:'Activo · En línea' },
  'profile.lang':           { it:'Lingua', en:'Language', fr:'Langue', de:'Sprache', es:'Idioma' },
  'profile.active_benefits':{ it:'Vantaggi Attivi', en:'Active Benefits', fr:'Avantages Actifs', de:'Aktive Vorteile', es:'Beneficios Activos' },
  'profile.posts_read':     { it:'Post letti', en:'Posts read', fr:'Posts lus', de:'Gelesene Beiträge', es:'Posts leídos' },
  'profile.comments':       { it:'Commenti', en:'Comments', fr:'Commentaires', de:'Kommentare', es:'Comentarios' },
  'profile.discussions':    { it:'Discussioni', en:'Discussions', fr:'Discussions', de:'Diskussionen', es:'Discusiones' },
  'profile.position':       { it:'Posizione', en:'Position', fr:'Position', de:'Position', es:'Posición' },
  'profile.member_since':   { it:'Membro dal', en:'Member since', fr:'Membre depuis le', de:'Mitglied seit', es:'Miembro desde' },
  'profile.verified':       { it:'✓ Verificato', en:'✓ Verified', fr:'✓ Vérifié', de:'✓ Verifiziert', es:'✓ Verificado' },
  'profile.early_founder':  { it:'🏆 Early Founder', en:'🏆 Early Founder', fr:'🏆 Fondateur Précoce', de:'🏆 Früher Gründer', es:'🏆 Fundador Temprano' },
  'profile.admin_badge':    { it:'🛡 Amministratore', en:'🛡 Administrator', fr:'🛡 Administrateur', de:'🛡 Administrator', es:'🛡 Administrador' },
  'profile.benefits_founding':{ it:['Accesso anticipato ai listing esclusivi','Canale diretto con il team','Prenotazioni prioritarie','Status permanente Founding Member','Notifiche esclusive in tempo reale'], en:['Early access to exclusive listings','Direct channel with the team','Priority bookings','Permanent Founding Member status','Real-time exclusive notifications'], fr:['Accès anticipé aux annonces exclusives','Canal direct avec l\'équipe','Réservations prioritaires','Statut permanent Membre Fondateur','Notifications exclusives en temps réel'], de:['Frühzeitiger Zugang zu exklusiven Angeboten','Direktkanal mit dem Team','Prioritätsbuchungen','Permanenter Gründungsmitglied-Status','Exklusive Echtzeit-Benachrichtigungen'], es:['Acceso anticipado a anuncios exclusivos','Canal directo con el equipo','Reservas prioritarias','Estado permanente Miembro Fundador','Notificaciones exclusivas en tiempo real'] },
  'profile.benefits_candidate':{ it:['Aggiornamenti esclusivi','Anteprime contenuti','Accesso alla Community','Interazione e feedback'], en:['Exclusive updates','Content previews','Community access','Interaction and feedback'], fr:['Mises à jour exclusives','Aperçus de contenu','Accès à la Communauté','Interaction et retours'], de:['Exklusive Updates','Inhaltsvorschauen','Community-Zugang','Interaktion und Feedback'], es:['Actualizaciones exclusivas','Vistas previas de contenido','Acceso a la Comunidad','Interacción y retroalimentación'] },
  'profile.unlock_with':    { it:'Sblocca con Founding Member:', en:'Unlock with Founding Member:', fr:'Débloquer avec Membre Fondateur:', de:'Mit Gründungsmitglied freischalten:', es:'Desbloquear con Miembro Fundador:' },
  'profile.locked_benefits':{ it:['Listing esclusivi','Prenotazioni anticipate','Canale diretto team','Status permanente'], en:['Exclusive listings','Early bookings','Direct team channel','Permanent status'], fr:['Annonces exclusives','Réservations anticipées','Canal direct équipe','Statut permanent'], de:['Exklusive Angebote','Frühbuchungen','Direktkanal zum Team','Permanenter Status'], es:['Anuncios exclusivos','Reservas anticipadas','Canal directo con el equipo','Estado permanente'] },
  'profile.upgrade_btn':    { it:'Richiedi Upgrade', en:'Request Upgrade', fr:'Demander une Mise à Niveau', de:'Upgrade anfragen', es:'Solicitar Upgrade' },
  'profile.notif_settings': { it:'Impostazioni Notifiche', en:'Notification Settings', fr:'Paramètres de Notifications', de:'Benachrichtigungseinstellungen', es:'Configuración de Notificaciones' },
  'profile.notif_project':  { it:'Aggiornamenti progetto', en:'Project updates', fr:'Mises à jour du projet', de:'Projektaktualisierungen', es:'Actualizaciones del proyecto' },
  'profile.notif_project_d':{ it:'Ricevi notifiche per i nuovi aggiornamenti del team', en:'Receive notifications for new team updates', fr:'Recevez des notifications pour les nouvelles mises à jour de l\'équipe', de:'Benachrichtigungen für neue Team-Updates erhalten', es:'Recibe notificaciones para las nuevas actualizaciones del equipo' },
  'profile.notif_dm':       { it:'Messaggi diretti', en:'Direct messages', fr:'Messages directs', de:'Direktnachrichten', es:'Mensajes directos' },
  'profile.notif_dm_d':     { it:'Notifiche per i messaggi privati ricevuti', en:'Notifications for received private messages', fr:'Notifications pour les messages privés reçus', de:'Benachrichtigungen für erhaltene Privatnachrichten', es:'Notificaciones para los mensajes privados recibidos' },
  'profile.notif_listings': { it:'Nuovi listing', en:'New listings', fr:'Nouvelles annonces', de:'Neue Angebote', es:'Nuevos anuncios' },
  'profile.notif_listings_d':{ it:'Avvisi quando viene aggiunta una nuova proprietà', en:'Alerts when a new property is added', fr:'Alertes lorsqu\'une nouvelle propriété est ajoutée', de:'Benachrichtigungen, wenn eine neue Immobilie hinzugefügt wird', es:'Alertas cuando se agrega una nueva propiedad' },
  'profile.notif_surveys':  { it:'Nuovi sondaggi', en:'New surveys', fr:'Nouveaux sondages', de:'Neue Umfragen', es:'Nuevas encuestas' },
  'profile.notif_surveys_d':{ it:'Notifica quando viene pubblicato un nuovo sondaggio', en:'Notification when a new survey is published', fr:'Notification lorsqu\'un nouveau sondage est publié', de:'Benachrichtigung, wenn eine neue Umfrage veröffentlicht wird', es:'Notificación cuando se publica una nueva encuesta' },
  'profile.notif_disc':     { it:'Nuove discussioni', en:'New discussions', fr:'Nouvelles discussions', de:'Neue Diskussionen', es:'Nuevas discusiones' },
  'profile.notif_disc_d':   { it:'Notifiche quando viene creata una nuova discussione', en:'Notifications when a new discussion is created', fr:'Notifications lorsqu\'une nouvelle discussion est créée', de:'Benachrichtigungen, wenn eine neue Diskussion erstellt wird', es:'Notificaciones cuando se crea una nueva discusión' },
  'profile.notif_replies':  { it:'Risposte ai tuoi thread', en:'Replies to your threads', fr:'Réponses à vos fils', de:'Antworten auf Ihre Threads', es:'Respuestas a tus hilos' },
  'profile.notif_replies_d':{ it:'Notifiche per le risposte nelle discussioni create da te', en:'Notifications for replies in discussions created by you', fr:'Notifications pour les réponses dans les discussions que vous avez créées', de:'Benachrichtigungen für Antworten in von Ihnen erstellten Diskussionen', es:'Notificaciones para las respuestas en las discusiones que has creado' },
  'profile.notif_mentions': { it:'Menzioni nei thread', en:'Mentions in threads', fr:'Mentions dans les fils', de:'Erwähnungen in Threads', es:'Menciones en hilos' },
  'profile.notif_mentions_d':{ it:'Notifica quando qualcuno ti menziona in una discussione', en:'Notification when someone mentions you in a discussion', fr:'Notification lorsque quelqu\'un vous mentionne dans une discussion', de:'Benachrichtigung, wenn Sie in einer Diskussion erwähnt werden', es:'Notificación cuando alguien te menciona en una discusión' },

  /* ─────────────────────────────────────────
     TOAST MESSAGES
  ───────────────────────────────────────── */
  'toast.report_received':  { it:'Nuova segnalazione ricevuta!', en:'New report received!', fr:'Nouveau signalement reçu!', de:'Neue Meldung eingegangen!', es:'¡Nuevo informe recibido!' },
  'toast.unauthorized':     { it:'Accesso non autorizzato.', en:'Unauthorized access.', fr:'Accès non autorisé.', de:'Nicht autorisierter Zugriff.', es:'Acceso no autorizado.' },
  'toast.request_sent':     { it:'Richiesta inviata al team. Sarai contattato a breve!', en:'Request sent to the team. You will be contacted shortly!', fr:'Demande envoyée à l\'équipe. Vous serez contacté prochainement!', de:'Anfrage an das Team gesendet. Sie werden in Kürze kontaktiert!', es:'Solicitud enviada al equipo. ¡Serás contactado en breve!' },
  'toast.link_copied':      { it:'Link copiato negli appunti!', en:'Link copied to clipboard!', fr:'Lien copié dans le presse-papiers!', de:'Link in die Zwischenablage kopiert!', es:'¡Enlace copiado al portapapeles!' },
  'toast.activity_cleared': { it:'Attività recente svuotata per te', en:'Recent activity cleared for you', fr:'Activité récente effacée pour vous', de:'Letzte Aktivität für Sie geleert', es:'Actividad reciente borrada para ti' },
  'toast.like_added':       { it:'Hai messo like al post!', en:'You liked the post!', fr:'Vous avez aimé le post!', de:'Sie haben den Beitrag geliked!', es:'¡Has dado me gusta al post!' },
  'toast.comment_published':{ it:'Commento pubblicato!', en:'Comment published!', fr:'Commentaire publié!', de:'Kommentar veröffentlicht!', es:'¡Comentario publicado!' },
  'toast.reply_published':  { it:'Risposta pubblicata con successo!', en:'Reply published successfully!', fr:'Réponse publiée avec succès!', de:'Antwort erfolgreich veröffentlicht!', es:'¡Respuesta publicada con éxito!' },
  'toast.thread_published': { it:'Thread pubblicato con successo!', en:'Thread published successfully!', fr:'Fil publié avec succès!', de:'Thread erfolgreich veröffentlicht!', es:'¡Hilo publicado con éxito!' },
  'toast.invalid_title':    { it:'Inserisci un titolo per il thread.', en:'Please enter a title for the thread.', fr:'Veuillez saisir un titre pour le fil.', de:'Bitte geben Sie einen Titel für den Thread ein.', es:'Por favor, introduce un título para el hilo.' },
  'toast.invalid_body':     { it:'Inserisci il messaggio iniziale.', en:'Please enter the initial message.', fr:'Veuillez saisir le message initial.', de:'Bitte geben Sie die erste Nachricht ein.', es:'Por favor, introduce el mensaje inicial.' },
  'toast.format_unsupported':{ it:'Formato non supportato. Usa immagini o video.', en:'Unsupported format. Use images or videos.', fr:'Format non supporté. Utilisez des images ou des vidéos.', de:'Nicht unterstütztes Format. Verwenden Sie Bilder oder Videos.', es:'Formato no compatible. Usa imágenes o videos.' },
  'toast.session_expired':  { it:'Sessione scaduta. Ricarica la pagina.', en:'Session expired. Reload the page.', fr:'Session expirée. Rechargez la page.', de:'Sitzung abgelaufen. Seite neu laden.', es:'Sesión expirada. Recarga la página.' },
  'toast.no_conv_open':     { it:'Nessuna conversazione aperta.', en:'No conversation open.', fr:'Aucune conversation ouverte.', de:'Kein offenes Gespräch.', es:'Ninguna conversación abierta.' },
  'toast.sending_media':    { it:'Invio media…', en:'Sending media…', fr:'Envoi du média…', de:'Medien werden gesendet…', es:'Enviando media…' },
  'toast.booking_progress': { it:'Prenotazione in corso…', en:'Booking in progress…', fr:'Réservation en cours…', de:'Buchung läuft…', es:'Reserva en progreso…' },
  'toast.booking_sent':     { it:'Prenotazione inviata! Il team ti contatterà a breve.', en:'Booking sent! The team will contact you shortly.', fr:'Réservation envoyée! L\'équipe vous contactera prochainement.', de:'Buchung gesendet! Das Team wird sich in Kürze bei Ihnen melden.', es:'¡Reserva enviada! El equipo se pondrá en contacto contigo en breve.' },
  'toast.vote_registered':  { it:'Voto registrato! Grazie per il tuo feedback.', en:'Vote registered! Thank you for your feedback.', fr:'Vote enregistré! Merci pour votre retour.', de:'Stimme registriert! Danke für Ihr Feedback.', es:'¡Voto registrado! Gracias por tus comentarios.' },
  'toast.all_notif_read':   { it:'Tutte le notifiche segnate come lette.', en:'All notifications marked as read.', fr:'Toutes les notifications marquées comme lues.', de:'Alle Benachrichtigungen als gelesen markiert.', es:'Todas las notificaciones marcadas como leídas.' },
  'toast.booking_restricted':{ it:'Le prenotazioni anticipate sono riservate ai Founding Members.', en:'Early bookings are reserved for Founding Members.', fr:'Les réservations anticipées sont réservées aux Membres Fondateurs.', de:'Frühbuchungen sind Gründungsmitgliedern vorbehalten.', es:'Las reservas anticipadas están reservadas para los Miembros Fundadores.' },
  'toast.must_auth':        { it:'Devi essere autenticato per prenotare.', en:'You must be authenticated to book.', fr:'Vous devez être authentifié pour réserver.', de:'Sie müssen authentifiziert sein, um zu buchen.', es:'Debes estar autenticado para reservar.' },
  'toast.error_event':      { it:'Errore aggiornamento evento.', en:'Event update error.', fr:'Erreur de mise à jour de l\'événement.', de:'Fehler beim Aktualisieren der Veranstaltung.', es:'Error al actualizar el evento.' },
  'toast.no_warn_msg':      { it:'Scrivi un messaggio prima di inviare.', en:'Write a message before sending.', fr:'Rédigez un message avant d\'envoyer.', de:'Bitte schreiben Sie eine Nachricht vor dem Senden.', es:'Escribe un mensaje antes de enviar.' },
  'toast.content_removed':  { it:'Contenuto rimosso con successo.', en:'Content removed successfully.', fr:'Contenu supprimé avec succès.', de:'Inhalt erfolgreich entfernt.', es:'Contenido eliminado con éxito.' },
  'toast.error_promotion':  { it:'Errore durante la promozione.', en:'Error during promotion.', fr:'Erreur lors de la promotion.', de:'Fehler bei der Beförderung.', es:'Error durante la promoción.' },
  'toast.error_demotion':   { it:'Errore durante la retrocessione.', en:'Error during demotion.', fr:'Erreur lors de la rétrogradation.', de:'Fehler bei der Herabstufung.', es:'Error durante la degradación.' },
  'toast.request_upgrade':  { it:'Richiesta inviata! Il team ti contatterà.', en:'Request sent! The team will contact you.', fr:'Demande envoyée! L\'équipe vous contactera.', de:'Anfrage gesendet! Das Team wird Sie kontaktieren.', es:'¡Solicitud enviada! El equipo se pondrá en contacto contigo.' },
  'toast.compressing_img':  { it:'Compressione immagine…', en:'Compressing image…', fr:'Compression de l\'image…', de:'Bild wird komprimiert…', es:'Comprimiendo imagen…' },
  'toast.preparing_video':  { it:'Preparazione video…', en:'Preparing video…', fr:'Préparation de la vidéo…', de:'Video wird vorbereitet…', es:'Preparando video…' },
  'toast.error_media':      { it:'Errore nella preparazione del file.', en:'Error preparing the file.', fr:'Erreur lors de la préparation du fichier.', de:'Fehler beim Vorbereiten der Datei.', es:'Error al preparar el archivo.' },

  /* ─────────────────────────────────────────
     QUICK MENU MEMBRO
  ───────────────────────────────────────── */
  'mqm.send_message':       { it:'Invia messaggio', en:'Send message', fr:'Envoyer un message', de:'Nachricht senden', es:'Enviar mensaje' },
  'mqm.you':                { it:'(Tu)', en:'(You)', fr:'(Vous)', de:'(Sie)', es:'(Tú)' },

  /* ─────────────────────────────────────────
     SELETTORE LINGUA
  ───────────────────────────────────────── */
  'lang.selector_label':    { it:'Lingua', en:'Language', fr:'Langue', de:'Sprache', es:'Idioma' },
  'lang.it':                { it:'Italiano', en:'Italian', fr:'Italien', de:'Italienisch', es:'Italiano' },
  'lang.en':                { it:'Inglese', en:'English', fr:'Anglais', de:'Englisch', es:'Inglés' },
  'lang.fr':                { it:'Francese', en:'French', fr:'Français', de:'Französisch', es:'Francés' },
  'lang.de':                { it:'Tedesco', en:'German', fr:'Allemand', de:'Deutsch', es:'Alemán' },
  'lang.es':                { it:'Spagnolo', en:'Spanish', fr:'Espagnol', de:'Spanisch', es:'Español' },

  /* ─────────────────────────────────────────
     MESI (per formatJoinDate)
  ───────────────────────────────────────── */
  'months':                 {
    it:['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
    en:['January','February','March','April','May','June','July','August','September','October','November','December'],
    fr:['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
    de:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
    es:['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  },

  /* ─────────────────────────────────────────
     TEMPI RELATIVI
  ───────────────────────────────────────── */
  'time.now':               { it:'Ora', en:'Now', fr:'Maintenant', de:'Jetzt', es:'Ahora' },
  'time.m_ago':             { it:'{n}m fa', en:'{n}m ago', fr:'il y a {n}m', de:'vor {n}m', es:'hace {n}m' },
  'time.h_ago':             { it:'{n}h fa', en:'{n}h ago', fr:'il y a {n}h', de:'vor {n}h', es:'hace {n}h' },
  'time.d_ago':             { it:'{n}g fa', en:'{n}d ago', fr:'il y a {n}j', de:'vor {n}T', es:'hace {n}d' },

  /* ─────────────────────────────────────────
     MISC
  ───────────────────────────────────────── */
  'misc.cancel':            { it:'Annulla', en:'Cancel', fr:'Annuler', de:'Abbrechen', es:'Cancelar' },
  'misc.confirm':           { it:'Conferma', en:'Confirm', fr:'Confirmer', de:'Bestätigen', es:'Confirmar' },
  'misc.save':              { it:'Salva', en:'Save', fr:'Enregistrer', de:'Speichern', es:'Guardar' },
  'misc.close':             { it:'Chiudi', en:'Close', fr:'Fermer', de:'Schließen', es:'Cerrar' },
  'misc.error_network':     { it:'Errore di rete: ', en:'Network error: ', fr:'Erreur réseau: ', de:'Netzwerkfehler: ', es:'Error de red: ' },
  'misc.error_connection':  { it:'Errore di connessione: ', en:'Connection error: ', fr:'Erreur de connexion: ', de:'Verbindungsfehler: ', es:'Error de conexión: ' },
  'misc.no_file_selected':  { it:'Nessun file selezionato', en:'No file selected', fr:'Aucun fichier sélectionné', de:'Keine Datei ausgewählt', es:'Ningún archivo seleccionado' },
  'misc.title_page':        { it:'Community Hub — LuxHaven360', en:'Community Hub — LuxHaven360', fr:'Community Hub — LuxHaven360', de:'Community Hub — LuxHaven360', es:'Community Hub — LuxHaven360' },
};

/* ═══════════════════════════════════════════════════════════════
   FUNZIONI PRINCIPALI i18n
   ═══════════════════════════════════════════════════════════════ */

/**
 * Restituisce la traduzione per la chiave data nella lingua corrente.
 * Supporta template {n} per valori dinamici.
 * @param {string} key
 * @param {Object} [vars]  es. { n: 5 }
 * @returns {string|string[]}
 */
window.T = function(key, vars) {
  const lang = window._i18nCurrentLang || 'it';
  const dict = window._i18nDict;
  if (!dict[key]) {
    console.warn('[i18n] Missing key:', key);
    return key;
  }
  let val = dict[key][lang] || dict[key]['it'] || key;
  if (vars && typeof val === 'string') {
    Object.keys(vars).forEach(k => {
      val = val.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
    });
  }
  return val;
};

/**
 * Imposta la lingua corrente e aggiorna tutta la pagina.
 * @param {string} lang  'it'|'en'|'fr'|'de'|'es'
 */
window.setLang = function(lang) {
  const valid = ['it','en','fr','de','es'];
  if (!valid.includes(lang)) return;
  window._i18nCurrentLang = lang;
  try { localStorage.setItem('lh360_lang', lang); } catch(e) {}
  document.documentElement.lang = lang;
  applyTranslations();
  // Aggiorna titolo pagina
  document.title = T('misc.title_page');
  // Aggiorna selettore lingua
  const sel = document.getElementById('langSelector');
  if (sel) sel.value = lang;
  // Aggiorna giorni della settimana nel chart analytics
  _updateWeeklyChartLabels();
  // Aggiorna mesi in formatJoinDate (sovrascrive funzione originale)
  _patchMonthsArray();
};

/**
 * Applica tutte le traduzioni ai data-i18n nel DOM.
 */
function applyTranslations() {
  // Testo contenuto
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = T(key);
    if (typeof val === 'string') el.textContent = val;
  });
  // Testo innerHTML (per elementi con HTML interno)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    const val = T(key);
    if (typeof val === 'string') el.innerHTML = val;
  });
  // Placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const val = T(key);
    if (typeof val === 'string') el.placeholder = val;
  });
  // Title attribute
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    const val = T(key);
    if (typeof val === 'string') el.title = val;
  });
  // Aggiorna il titolo della pagina HTML
  document.title = T('misc.title_page');
}

/**
 * Aggiorna le label dei giorni nel grafico weekly analytics.
 */
function _updateWeeklyChartLabels() {
  const labelsEl = document.getElementById('weeklyChartLabels');
  if (!labelsEl) return;
  const days = T('analytics.days');
  if (Array.isArray(days)) {
    const spans = labelsEl.querySelectorAll('span');
    days.forEach((d, i) => { if (spans[i]) spans[i].textContent = d; });
  }
}

/**
 * Sovrascrive l'array dei mesi usato da formatJoinDate con quello tradotto.
 */
function _patchMonthsArray() {
  // formatJoinDate usa un array inline — lo sovrascriviamo ridefinendo la funzione
  const months = T('months');
  if (!Array.isArray(months)) return;
  window._i18nMonths = months;
}

/* ═══════════════════════════════════════════════════════════════
   LANGUAGE SELECTOR — crea e inserisce il widget nella pagina
   ═══════════════════════════════════════════════════════════════ */
function _createLangSelector() {
  // Evita duplicati
  if (document.getElementById('langSelectorWrap')) return;

  const wrap = document.createElement('div');
  wrap.id = 'langSelectorWrap';
  wrap.style.cssText = `
    display:flex; align-items:center; gap:0.35rem;
    position:relative;
  `;

  const flags = { it:'🇮🇹', en:'🇬🇧', fr:'🇫🇷', de:'🇩🇪', es:'🇪🇸' };
  const langs = ['it','en','fr','de','es'];

  // Bottone trigger
  const trigger = document.createElement('button');
  trigger.id = 'langSelectorBtn';
  trigger.style.cssText = `
    display:flex; align-items:center; gap:0.35rem;
    background:var(--dark5); border:1px solid var(--border2);
    border-radius:7px; padding:0.28rem 0.6rem;
    color:var(--muted); font-family:var(--ff-ui);
    font-size:0.72rem; cursor:pointer;
    transition:all 0.18s; white-space:nowrap;
  `;
  trigger.onmouseenter = () => {
    trigger.style.borderColor = 'var(--gold-dim)';
    trigger.style.color = 'var(--gold)';
  };
  trigger.onmouseleave = () => {
    trigger.style.borderColor = 'var(--border2)';
    trigger.style.color = 'var(--muted)';
  };

  function updateTrigger() {
    const lang = window._i18nCurrentLang;
    trigger.innerHTML = `${flags[lang] || '🌐'} <span style="letter-spacing:0.06em;text-transform:uppercase;font-weight:600;">${lang.toUpperCase()}</span>`;
  }
  updateTrigger();

  // Dropdown
  const dropdown = document.createElement('div');
  dropdown.id = 'langDropdown';
  dropdown.style.cssText = `
    display:none; position:absolute; top:calc(100% + 6px); right:0;
    background:var(--dark3); border:1px solid var(--border);
    border-radius:9px; box-shadow:0 12px 36px rgba(0,0,0,0.6);
    overflow:hidden; z-index:9999; min-width:130px;
    animation:panelFade 0.18s ease;
  `;

  langs.forEach(code => {
    const names = { it:'Italiano', en:'English', fr:'Français', de:'Deutsch', es:'Español' };
    const item = document.createElement('button');
    item.style.cssText = `
      display:flex; align-items:center; gap:0.55rem;
      width:100%; padding:0.55rem 0.9rem;
      background:none; border:none; border-bottom:1px solid var(--border2);
      color:var(--muted); font-family:var(--ff-ui); font-size:0.75rem;
      cursor:pointer; transition:all 0.15s; text-align:left;
    `;
    item.innerHTML = `${flags[code]} <span>${names[code]}</span>`;
    item.onmouseenter = () => {
      item.style.background = 'var(--gold-faint)';
      item.style.color = 'var(--gold)';
    };
    item.onmouseleave = () => {
      item.style.background = 'none';
      item.style.color = window._i18nCurrentLang === code ? 'var(--gold)' : 'var(--muted)';
    };
    item.onclick = (e) => {
      e.stopPropagation();
      setLang(code);
      updateTrigger();
      dropdown.style.display = 'none';
      // Highlight lingua attiva
      dropdown.querySelectorAll('button').forEach(b => b.style.color = 'var(--muted)');
      item.style.color = 'var(--gold)';
    };
    // Evidenzia lingua corrente
    if (code === window._i18nCurrentLang) item.style.color = 'var(--gold)';
    dropdown.appendChild(item);
  });

  trigger.onclick = (e) => {
    e.stopPropagation();
    const isOpen = dropdown.style.display !== 'none';
    dropdown.style.display = isOpen ? 'none' : 'block';
  };
  document.addEventListener('click', () => { dropdown.style.display = 'none'; });

  wrap.appendChild(trigger);
  wrap.appendChild(dropdown);

  // Inserisci prima del bottone notifiche nell'header
  const headerActions = document.querySelector('.header-actions');
  if (headerActions) {
    headerActions.insertBefore(wrap, headerActions.firstChild);
  }
}

/* ═══════════════════════════════════════════════════════════════
   INIT — eseguito quando il DOM è pronto
   ═══════════════════════════════════════════════════════════════ */
(function initI18n() {
  function _init() {
    applyTranslations();
    _patchMonthsArray();
    // Inserisce il selettore lingua nell'header una volta che l'app è attiva
    // Aspetta che #mainApp sia visibile (login completato)
    const observer = new MutationObserver(() => {
      const app = document.getElementById('mainApp');
      if (app && app.classList.contains('active')) {
        _createLangSelector();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
    // Se l'app è già attiva (sessione salvata)
    const app = document.getElementById('mainApp');
    if (app && app.classList.contains('active')) {
      _createLangSelector();
    }
    // Patch _notifRelTime per usare traduzioni i18n
    _patchNotifRelTime();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }
})();

/* ═══════════════════════════════════════════════════════════════
   PATCH — _notifRelTime per usare le traduzioni
   ═══════════════════════════════════════════════════════════════ */
function _patchNotifRelTime() {
  const _orig = window._notifRelTime;
  window._notifRelTime = function(ts) {
    if (!ts) return T('time.now');
    const diff = Date.now() - ts;
    if (diff < 0) return T('time.now');
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1)  return T('time.now');
    if (m < 60) return T('time.m_ago', { n: m });
    if (h < 24) return T('time.h_ago', { n: h });
    if (d < 7)  return T('time.d_ago', { n: d });
    const months = window._i18nMonths || T('months');
    const dt = new Date(ts);
    return dt.getDate() + ' ' + (Array.isArray(months) ? months[dt.getMonth()].substring(0,3) : dt.toLocaleDateString());
  };
}

/* ═══════════════════════════════════════════════════════════════
   PATCH — formatJoinDate per usare i mesi tradotti
   ═══════════════════════════════════════════════════════════════ */
(function _patchFormatJoinDate() {
  const _waitAndPatch = () => {
    if (typeof window.formatJoinDate === 'function') {
      window.formatJoinDate = function(raw) {
        if (!raw) return '—';
        const months = window._i18nMonths || T('months');
        try {
          const d = new Date(raw);
          if (!isNaN(d.getTime())) return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
          const m = String(raw).match(/(\d{1,2})[\/\.](\d{2})[\/\.](\d{4})/);
          if (m) return `${parseInt(m[1])} ${months[parseInt(m[2])-1]} ${m[3]}`;
        } catch(_e) {}
        return String(raw);
      };
    } else {
      setTimeout(_waitAndPatch, 300);
    }
  };
  setTimeout(_waitAndPatch, 500);
})();
