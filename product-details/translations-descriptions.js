/**
 * ============================================================
 *  translations-descriptions.js
 *  Traduzioni descrizioni prodotti — LuxHaven360
 *  Lingue: IT · EN · FR · DE · ES
 *
 *  STRUTTURA PER PRODOTTO:
 *  {
 *    shortDesc : { it, en, fr, de, es }   → breve descrizione (sotto titolo)
 *    longDesc  : { it, en, fr, de, es }   → array di blocchi tipizzati
 *  }
 *
 *  TIPI DI BLOCCO (longDesc):
 *  { type: 'single'             , text }  → <p class="desc-single">
 *  { type: 'single-tight-bottom', text }  → <p class="desc-single tight-bottom">
 *  { type: 'para'               , text }  → <p class="desc-para">
 *  { type: 'para-tight-top'     , text }  → <p class="desc-para tight-top">
 *  { type: 'italic'             , text }  → <p class="desc-italic">
 *  { type: 'list-header'        , text }  → <p class="desc-list-header">
 *  { type: 'list'               , items } → <ul class="desc-list"><li>…</li>
 *  { type: 'size-note'          , text }  → <p class="desc-size-note">
 *  { type: 'divider'                   }  → decorative divider
 *
 *  BOLD INLINE: usa **testo** nei campi text/items → <strong>testo</strong>
 *
 *  AGGIUNGERE NUOVI PRODOTTI:
 *  Aggiungi una nuova entry con la chiave = SKU del prodotto.
 *  Il sistema la caricherà automaticamente al cambio lingua.
 * ============================================================
 */

const translationsDescriptions = {

  /* ══════════════════════════════════════════════════════════
     ME-01-LE  —  Vault Keys Hoodie
  ══════════════════════════════════════════════════════════ */
  'ME-01-LE': {

    shortDesc: {
      it: 'Il primo capo della collezione LuxHaven360. Grafica architettonica all-over, tessuto riciclato certificato, fatto a mano. Tiratura limitata. Disponibile ora.',
      en: 'The first piece of the LuxHaven360 collection. All-over architectural graphics, certified recycled fabric, handmade. Limited edition. Available now.',
      fr: 'La première pièce de la collection LuxHaven360. Graphisme architectural all-over, tissu recyclé certifié, fait main. Tirage limité. Disponible maintenant.',
      de: 'Das erste Stück der LuxHaven360-Kollektion. All-over-Architektur-Grafik, zertifizierter Recycling-Stoff, handgefertigt. Limitierte Auflage. Jetzt erhältlich.',
      es: 'La primera prenda de la colección LuxHaven360. Gráfico arquitectónico all-over, tejido reciclado certificado, hecho a mano. Tirada limitada. Disponible ahora.'
    },

    longDesc: {
      it: [
        { type: 'single', text: 'Alcune felpe si indossano. Questa si abita.' },
        { type: 'para',   text: 'La **Vault Keys Hoodie** non è un capo qualunque: è il primo oggetto da collezione firmato LuxHaven360, nato per chi non si accontenta dell\'ordinario e vuole portare con sé ogni giorno l\'estetica di un mondo fatto di proprietà straordinarie, chiavi simboliche e architetture senza tempo.' },
        { type: 'para',   text: 'La grafica all over, esclusiva e progettata nei minimi dettagli, avvolge ogni centimetro del tessuto con un pattern di chiavi dorate e facciate nobiliari su fondo blu notte. Un\'opera d\'arte che si indossa.' },
        { type: 'divider' },
        { type: 'single', text: 'Il tessuto fa la differenza.' },
        { type: 'para',   text: 'Realizzata in misto poliestere riciclato e spandex (95/5), offre una vestibilità rilassata e una morbidezza inaspettata, grazie all\'esterno effetto cotone e all\'interno in pile spazzolato. Calda quando serve. Leggera quando vuoi.' },
        { type: 'single', text: 'I dettagli rivelano l\'ossessione per la qualità.' },
        { type: 'para',   text: 'Cappuccio a doppio strato con grafica su entrambi i lati, cordini con occhielli ed estremità in metallo, cuciture overlock. Ogni pezzo è stampato, tagliato e cucito a mano da un team specializzato.' },
        { type: 'single', text: 'Rispetto per il pianeta, senza compromessi.' },
        { type: 'para',   text: 'Il contenuto riciclato è certificato GRS (Global Recycled Standard). Il tessuto è certificato OEKO-TEX Standard 100.' },
        { type: 'divider' },
        { type: 'italic', text: 'Grammatura: 308 g/m² · Stile unisex · Edizione limitata LuxHaven360' },
        { type: 'single', text: 'Questa non è una felpa. È il tuo biglietto d\'ingresso.' }
      ],
      en: [
        { type: 'single', text: 'Some hoodies are worn. This one is inhabited.' },
        { type: 'para',   text: 'The **Vault Keys Hoodie** is not just any garment: it is the first collectible piece by LuxHaven360, created for those who refuse the ordinary and want to carry with them every day the aesthetic of a world made of extraordinary properties, symbolic keys, and timeless architecture.' },
        { type: 'para',   text: 'The all-over graphic, exclusive and designed down to the finest detail, wraps every centimetre of the fabric with a pattern of golden keys and aristocratic façades on a midnight blue background. A work of art to be worn.' },
        { type: 'divider' },
        { type: 'single', text: 'The fabric makes the difference.' },
        { type: 'para',   text: 'Crafted from a recycled polyester and spandex blend (95/5), it offers a relaxed fit and unexpected softness, thanks to the cotton-effect exterior and brushed fleece interior. Warm when you need it. Light when you don\'t.' },
        { type: 'single', text: 'The details reveal an obsession with quality.' },
        { type: 'para',   text: 'Double-layer hood with graphics on both sides, cords with metal-tipped eyelets, overlock stitching. Each piece is printed, cut, and sewn by hand by a specialist team.' },
        { type: 'single', text: 'Respect for the planet, without compromise.' },
        { type: 'para',   text: 'The recycled content is GRS certified (Global Recycled Standard). The fabric is OEKO-TEX Standard 100 certified.' },
        { type: 'divider' },
        { type: 'italic', text: 'Weight: 308 g/m² · Unisex style · LuxHaven360 Limited Edition' },
        { type: 'single', text: 'This is not a hoodie. It is your entry ticket.' }
      ],
      fr: [
        { type: 'single', text: 'Certains sweats se portent. Celui-ci s\'habite.' },
        { type: 'para',   text: 'Le **Vault Keys Hoodie** n\'est pas un vêtement ordinaire : c\'est la première pièce de collection signée LuxHaven360, née pour ceux qui refusent l\'ordinaire et veulent porter au quotidien l\'esthétique d\'un monde fait de propriétés extraordinaires, de clés symboliques et d\'architectures intemporelles.' },
        { type: 'para',   text: 'Le graphisme all over, exclusif et conçu dans les moindres détails, enveloppe chaque centimètre du tissu d\'un motif de clés dorées et de façades nobles sur fond bleu nuit. Une œuvre d\'art que l\'on porte.' },
        { type: 'divider' },
        { type: 'single', text: 'Le tissu fait la différence.' },
        { type: 'para',   text: 'Fabriqué en mélange polyester recyclé et spandex (95/5), il offre un ajustement décontracté et une douceur inattendue, grâce à l\'extérieur effet coton et l\'intérieur en polaire brossée. Chaud quand il le faut. Léger quand vous le souhaitez.' },
        { type: 'single', text: 'Les détails révèlent l\'obsession pour la qualité.' },
        { type: 'para',   text: 'Capuche double épaisseur avec graphisme sur les deux faces, cordons avec œillets et extrémités en métal, coutures overlock. Chaque pièce est imprimée, découpée et cousue à la main par une équipe spécialisée.' },
        { type: 'single', text: 'Respect de la planète, sans compromis.' },
        { type: 'para',   text: 'Le contenu recyclé est certifié GRS (Global Recycled Standard). Le tissu est certifié OEKO-TEX Standard 100.' },
        { type: 'divider' },
        { type: 'italic', text: 'Grammage : 308 g/m² · Style unisexe · Édition limitée LuxHaven360' },
        { type: 'single', text: 'Ce n\'est pas un sweat. C\'est votre passeport d\'entrée.' }
      ],
      de: [
        { type: 'single', text: 'Manche Hoodies werden getragen. Diesen bewohnt man.' },
        { type: 'para',   text: 'Der **Vault Keys Hoodie** ist kein gewöhnliches Kleidungsstück: Er ist das erste Sammlerstück von LuxHaven360, entstanden für diejenigen, die sich mit dem Gewöhnlichen nicht abfinden und täglich die Ästhetik einer Welt aus außergewöhnlichen Immobilien, symbolischen Schlüsseln und zeitloser Architektur tragen möchten.' },
        { type: 'para',   text: 'Die exklusive All-over-Grafik, bis ins kleinste Detail gestaltet, umhüllt jeden Zentimeter des Stoffes mit einem Muster aus goldenen Schlüsseln und noblen Fassaden auf nachtblauem Untergrund. Ein Kunstwerk zum Tragen.' },
        { type: 'divider' },
        { type: 'single', text: 'Der Stoff macht den Unterschied.' },
        { type: 'para',   text: 'Aus einer Mischung aus recyceltem Polyester und Spandex (95/5) gefertigt, bietet er eine entspannte Passform und unerwartete Weichheit dank der Baumwoll-Effekt-Außenseite und des gebürsteten Fleece-Innenfutters. Warm wenn nötig. Leicht wenn gewünscht.' },
        { type: 'single', text: 'Die Details offenbaren die Obsession für Qualität.' },
        { type: 'para',   text: 'Doppellagige Kapuze mit Grafik auf beiden Seiten, Kordeln mit metallgespitzten Ösen, Overlock-Nähte. Jedes Stück wird von einem Spezialistenteam von Hand bedruckt, zugeschnitten und genäht.' },
        { type: 'single', text: 'Respekt für den Planeten, ohne Kompromisse.' },
        { type: 'para',   text: 'Der Recyclinganteil ist GRS-zertifiziert (Global Recycled Standard). Der Stoff ist nach OEKO-TEX Standard 100 zertifiziert.' },
        { type: 'divider' },
        { type: 'italic', text: 'Gewicht: 308 g/m² · Unisex-Stil · LuxHaven360 Limitierte Auflage' },
        { type: 'single', text: 'Das ist kein Hoodie. Das ist dein Eintrittsbillet.' }
      ],
      es: [
        { type: 'single', text: 'Algunas sudaderas se llevan. Esta se habita.' },
        { type: 'para',   text: 'La **Vault Keys Hoodie** no es una prenda cualquiera: es el primer objeto de colección firmado por LuxHaven360, creado para quienes no se conforman con lo ordinario y quieren llevar consigo cada día la estética de un mundo hecho de propiedades extraordinarias, llaves simbólicas y arquitecturas atemporales.' },
        { type: 'para',   text: 'El gráfico all over, exclusivo y diseñado hasta el mínimo detalle, envuelve cada centímetro del tejido con un patrón de llaves doradas y fachadas nobles sobre fondo azul noche. Una obra de arte que se lleva.' },
        { type: 'divider' },
        { type: 'single', text: 'El tejido marca la diferencia.' },
        { type: 'para',   text: 'Fabricada en mezcla de poliéster reciclado y spandex (95/5), ofrece un ajuste relajado y una suavidad inesperada gracias al exterior efecto algodón y el interior de forro polar cepillado. Cálida cuando la necesitas. Ligera cuando quieres.' },
        { type: 'single', text: 'Los detalles revelan la obsesión por la calidad.' },
        { type: 'para',   text: 'Capucha de doble capa con gráfico en ambos lados, cordones con ojales y extremos de metal, costuras overlock. Cada pieza es impresa, cortada y cosida a mano por un equipo especializado.' },
        { type: 'single', text: 'Respeto por el planeta, sin compromisos.' },
        { type: 'para',   text: 'El contenido reciclado está certificado GRS (Global Recycled Standard). El tejido está certificado OEKO-TEX Standard 100.' },
        { type: 'divider' },
        { type: 'italic', text: 'Gramaje: 308 g/m² · Estilo unisex · Edición limitada LuxHaven360' },
        { type: 'single', text: 'Esto no es una sudadera. Es tu entrada.' }
      ]
    }
  },

  /* ══════════════════════════════════════════════════════════
     ME-01-L&A  —  Signature Cap
  ══════════════════════════════════════════════════════════ */
  'ME-01-L&A': {

    shortDesc: {
      it: 'Ricamo artigianale. Twill di cotone 100%. Pensato per chi non si accontenta del primo cappello che trova.',
      en: 'Artisan embroidery. 100% cotton chino twill. Designed for those who refuse to settle for the first cap they find.',
      fr: 'Broderie artisanale. Twill de chino 100 % coton. Conçu pour ceux qui refusent de se contenter du premier chapeau venu.',
      de: 'Handwerkliche Stickerei. 100 % Baumwoll-Chino-Twill. Entworfen für alle, die sich nicht mit der erstbesten Cap zufriedengeben.',
      es: 'Bordado artesanal. Sarga de chino 100 % algodón. Diseñada para quienes no se conforman con el primer gorro que encuentran.'
    },

    longDesc: {
      it: [
        { type: 'single', text: 'Alcune cose parlano da sole. Questo cappello è una di quelle.' },
        { type: 'para',   text: 'Realizzato in twill di chino 100% cotone, strutturato per durare e pensato per chi non scende a compromessi sull\'estetica. Il ricamo delle iniziali LuxHaven360 — posizionato sulla calotta con precisione artigianale — non è una decorazione: è un riconoscimento. Un dettaglio che chi sa, nota.' },
        { type: 'para',   text: 'La visiera curva, i 6 pannelli a profilo basso e la fascia regolabile con fibbia anticata restituiscono una vestibilità impeccabile, adatta a ogni occasione — che tu stia visitando una villa sul lago o guidando lungo la costiera.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Dettagli costruttivi:' },
        { type: 'list', items: [
          '100% twill di chino di cotone',
          'Struttura a 6 pannelli, profilo basso',
          '6 occhielli ricamati',
          'Calotta da 3 ⅛"',
          'Fascetta regolabile con fibbia anticata in finitura vintage',
          'Ricamo esclusivo con le iniziali del brand'
        ]},
        { type: 'divider' },
        { type: 'single', text: 'Portare LuxHaven360 non è una scelta di stile. È una dichiarazione di appartenenza.' }
      ],
      en: [
        { type: 'single', text: 'Some things speak for themselves. This cap is one of them.' },
        { type: 'para',   text: 'Crafted from 100% cotton chino twill, structured to last and designed for those who make no concessions on aesthetics. The LuxHaven360 initials embroidery — placed on the crown with artisan precision — is not a decoration: it is a recognition. A detail that those who know, notice.' },
        { type: 'para',   text: 'The curved brim, 6 low-profile panels and adjustable strap with antique buckle deliver an impeccable fit, suited to every occasion — whether you\'re touring a lakeside villa or driving along the coast.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Construction details:' },
        { type: 'list', items: [
          '100% cotton chino twill',
          '6-panel structure, low profile',
          '6 embroidered eyelets',
          '3⅛" crown',
          'Adjustable strap with antique finish vintage buckle',
          'Exclusive embroidery with the brand\'s initials'
        ]},
        { type: 'divider' },
        { type: 'single', text: 'Wearing LuxHaven360 is not a style choice. It is a statement of belonging.' }
      ],
      fr: [
        { type: 'single', text: 'Certaines choses parlent d\'elles-mêmes. Ce chapeau en fait partie.' },
        { type: 'para',   text: 'Fabriqué en twill de chino 100 % coton, structuré pour durer et conçu pour ceux qui ne font aucun compromis sur l\'esthétique. La broderie des initiales LuxHaven360 — placée sur la calotte avec une précision artisanale — n\'est pas une décoration : c\'est une reconnaissance. Un détail que ceux qui savent, remarquent.' },
        { type: 'para',   text: 'La visière courbée, les 6 panneaux à profil bas et la sangle réglable avec boucle vieillie offrent un ajustement impeccable, adapté à chaque occasion — que vous visitiez une villa au bord du lac ou conduisiez le long de la côte.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Détails de construction :' },
        { type: 'list', items: [
          '100 % twill de chino de coton',
          'Structure 6 panneaux, profil bas',
          '6 œillets brodés',
          'Calotte de 3⅛"',
          'Sangle réglable avec boucle vieillie finition vintage',
          'Broderie exclusive avec les initiales de la marque'
        ]},
        { type: 'divider' },
        { type: 'single', text: 'Porter LuxHaven360 n\'est pas un choix de style. C\'est une déclaration d\'appartenance.' }
      ],
      de: [
        { type: 'single', text: 'Manche Dinge sprechen für sich. Diese Kappe ist eine davon.' },
        { type: 'para',   text: 'Aus 100 % Baumwoll-Chino-Twill gefertigt, strukturiert für Langlebigkeit und entworfen für jene, die keine Kompromisse bei der Ästhetik eingehen. Die Stickerei der LuxHaven360-Initialen — mit handwerklicher Präzision auf dem Deckel platziert — ist keine Dekoration: Es ist eine Anerkennung. Ein Detail, das Kenner bemerken.' },
        { type: 'para',   text: 'Das geschwungene Schild, die 6 Low-Profile-Paneele und der verstellbare Riemen mit antikem Schnallenverschluss bieten eine tadellose Passform für jeden Anlass — egal ob Sie eine Villa am See besichtigen oder an der Küste entlangfahren.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Konstruktionsdetails:' },
        { type: 'list', items: [
          '100 % Baumwoll-Chino-Twill',
          '6-Paneel-Struktur, niedriges Profil',
          '6 gestickte Ösen',
          'Deckel von 3⅛"',
          'Verstellbarer Riemen mit antikem Vintage-Schnallenverschluss',
          'Exklusive Stickerei mit den Initialen der Marke'
        ]},
        { type: 'divider' },
        { type: 'single', text: 'LuxHaven360 zu tragen ist keine Stilentscheidung. Es ist ein Bekenntnis zur Zugehörigkeit.' }
      ],
      es: [
        { type: 'single', text: 'Algunas cosas hablan por sí solas. Esta gorra es una de ellas.' },
        { type: 'para',   text: 'Fabricada en sarga de chino 100 % algodón, estructurada para durar y diseñada para quienes no hacen concesiones en estética. El bordado de las iniciales LuxHaven360 — colocado en la copa con precisión artesanal — no es una decoración: es un reconocimiento. Un detalle que quienes saben, notan.' },
        { type: 'para',   text: 'La visera curvada, los 6 paneles de perfil bajo y la correa ajustable con hebilla envejecida ofrecen un ajuste impecable, adecuado para cada ocasión — ya sea que estés visitando una villa junto al lago o conduciendo por la costa.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Detalles de construcción:' },
        { type: 'list', items: [
          '100 % sarga de chino de algodón',
          'Estructura de 6 paneles, perfil bajo',
          '6 ojales bordados',
          'Copa de 3⅛"',
          'Correa ajustable con hebilla envejecida acabado vintage',
          'Bordado exclusivo con las iniciales de la marca'
        ]},
        { type: 'divider' },
        { type: 'single', text: 'Llevar LuxHaven360 no es una elección de estilo. Es una declaración de pertenencia.' }
      ]
    }
  },

  /* ══════════════════════════════════════════════════════════
     ME-01-A  —  Signature Long Sleeve
  ══════════════════════════════════════════════════════════ */
  'ME-01-A': {

    shortDesc: {
      it: 'Tessuto solido, vestibilità impeccabile, logo che parla da solo. Non è una maglietta. È una scelta.',
      en: 'Solid fabric, impeccable fit, a logo that speaks for itself. It\'s not a T-shirt. It\'s a choice.',
      fr: 'Tissu solide, coupe impeccable, logo qui parle de lui-même. Ce n\'est pas un t-shirt. C\'est un choix.',
      de: 'Solider Stoff, tadellose Passform, ein Logo das für sich spricht. Es ist kein T-Shirt. Es ist eine Entscheidung.',
      es: 'Tejido sólido, ajuste impecable, un logo que habla por sí solo. No es una camiseta. Es una elección.'
    },

    longDesc: {
      it: [
        { type: 'single', text: 'Indossare un\'idea. Rappresentare uno stile.' },
        { type: 'para',   text: 'Questa non è semplicemente una maglietta a maniche lunghe. È un contatto fisico con il mondo LuxHaven360, un brand nato per chi sa riconoscere il valore delle cose senza dover alzare la voce.' },
        { type: 'para',   text: 'Realizzata in 100% cotone filato ad anello da 206,8 g/m², la Signature Long Sleeve ha un peso e una morbidezza che si sentono al primo tocco. Il processo di tintura in capo le conferisce un carattere visivo ricercato, volutamente vissuto, impossibile da replicare: ogni capo è unico, come lo è chi lo sceglie.' },
        { type: 'para',   text: 'Prelevata per mantenere forma e colore nel tempo, costruita con nastro in twill da spalla a spalla e polsini a costine per una vestibilità che non tradisce mai. Dettagli pensati per durare, non per fare scena.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Caratteristiche principali:' },
        { type: 'list', items: [
          '100% cotone morbido filato ad anello',
          'Peso: 206,8 g/m² — consistente al tatto, confortevole tutto il giorno',
          'Tessuto tinto in capo, prelavato — aspetto ricercato, forma duratura',
          'Colletto classico con cucitura a vista',
          'Rinforzo in twill su colletto, spalle e nastro interno',
          'Polsini a costine dal fit preciso',
          'Vestibilità unisex comoda e versatile'
        ]}
      ],
      en: [
        { type: 'single', text: 'Wearing an idea. Representing a style.' },
        { type: 'para',   text: 'This is not simply a long-sleeve T-shirt. It is a physical connection to the LuxHaven360 world, a brand born for those who know how to recognise the value of things without raising their voice.' },
        { type: 'para',   text: 'Made from 100% ring-spun cotton at 206.8 g/m², the Signature Long Sleeve has a weight and softness you feel on first touch. The garment-dyeing process gives it a refined, deliberately lived-in visual character — impossible to replicate. Every piece is unique, just like the person who chooses it.' },
        { type: 'para',   text: 'Pre-washed to hold its shape and colour over time, built with twill tape from shoulder to shoulder and ribbed cuffs for a fit that never lets you down. Details designed to last, not to impress.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Key features:' },
        { type: 'list', items: [
          '100% soft ring-spun cotton',
          'Weight: 206.8 g/m² — substantial to the touch, comfortable all day',
          'Garment-dyed fabric, pre-washed — refined look, lasting shape',
          'Classic collar with topstitching',
          'Twill reinforcement on collar, shoulders and interior tape',
          'Precisely fitted ribbed cuffs',
          'Comfortable and versatile unisex fit'
        ]}
      ],
      fr: [
        { type: 'single', text: 'Porter une idée. Représenter un style.' },
        { type: 'para',   text: 'Ce n\'est pas simplement un t-shirt à manches longues. C\'est un contact physique avec le monde LuxHaven360, une marque née pour ceux qui savent reconnaître la valeur des choses sans avoir besoin d\'élever la voix.' },
        { type: 'para',   text: 'Fabriqué en 100 % coton filé en anneau à 206,8 g/m², la Signature Long Sleeve a un poids et une douceur qui se sentent au premier toucher. Le processus de teinture en pièce lui confère un caractère visuel raffiné, délibérément vécu, impossible à reproduire. Chaque pièce est unique, tout comme la personne qui la choisit.' },
        { type: 'para',   text: 'Prélavée pour conserver la forme et la couleur dans le temps, construite avec du ruban en twill d\'épaule à épaule et des poignets côtelés pour un ajustement qui ne trahit jamais. Des détails pensés pour durer, pas pour impressionner.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Caractéristiques principales :' },
        { type: 'list', items: [
          '100 % coton doux filé en anneau',
          'Poids : 206,8 g/m² — consistant au toucher, confortable toute la journée',
          'Tissu teint en pièce, prélavé — aspect raffiné, forme durable',
          'Col classique avec surpiqûre visible',
          'Renfort en twill sur col, épaules et bande intérieure',
          'Poignets côtelés d\'ajustement précis',
          'Coupe unisexe confortable et polyvalente'
        ]}
      ],
      de: [
        { type: 'single', text: 'Eine Idee tragen. Einen Stil verkörpern.' },
        { type: 'para',   text: 'Dies ist nicht einfach ein Langarm-T-Shirt. Es ist eine physische Verbindung zur Welt von LuxHaven360, einer Marke, die für diejenigen entstanden ist, die den Wert der Dinge erkennen können, ohne ihre Stimme erheben zu müssen.' },
        { type: 'para',   text: 'Aus 100 % ringgesponnener Baumwolle mit 206,8 g/m² gefertigt, hat der Signature Long Sleeve ein Gewicht und eine Weichheit, die man beim ersten Berühren spürt. Der Garment-Dye-Prozess verleiht ihm einen verfeinerten, bewusst gelebten visuellen Charakter — unmöglich zu replizieren. Jedes Stück ist einzigartig, genau wie die Person, die es wählt.' },
        { type: 'para',   text: 'Vorgewaschen, um Form und Farbe langfristig zu erhalten, mit Twillband von Schulter zu Schulter und gerippten Manschetten für eine Passform, die nie enttäuscht. Details, die für Langlebigkeit entworfen wurden, nicht für Eindruck.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Hauptmerkmale:' },
        { type: 'list', items: [
          '100 % weiches ringgesponnenes Baumwoll',
          'Gewicht: 206,8 g/m² — fühlbar am Körper, den ganzen Tag komfortabel',
          'Garment-gefärbter Stoff, vorgewaschen — raffinierter Look, dauerhafte Form',
          'Klassischer Kragen mit sichtbarer Steppnaht',
          'Twill-Verstärkung an Kragen, Schultern und Innenband',
          'Präzise passende gerippte Manschetten',
          'Bequeme und vielseitige Unisex-Passform'
        ]}
      ],
      es: [
        { type: 'single', text: 'Llevar una idea. Representar un estilo.' },
        { type: 'para',   text: 'Esta no es simplemente una camiseta de manga larga. Es un contacto físico con el mundo LuxHaven360, una marca nacida para quienes saben reconocer el valor de las cosas sin necesidad de alzar la voz.' },
        { type: 'para',   text: 'Fabricada en 100 % algodón hilado en anillo a 206,8 g/m², la Signature Long Sleeve tiene un peso y una suavidad que se sienten en el primer toque. El proceso de teñido en prenda le confiere un carácter visual refinado, deliberadamente vivido, imposible de replicar. Cada prenda es única, igual que quien la elige.' },
        { type: 'para',   text: 'Prelavada para mantener la forma y el color a lo largo del tiempo, construida con cinta de sarga de hombro a hombro y puños de canalé para un ajuste que nunca defrauda. Detalles diseñados para durar, no para impresionar.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Características principales:' },
        { type: 'list', items: [
          '100 % algodón suave hilado en anillo',
          'Peso: 206,8 g/m² — consistente al tacto, cómoda todo el día',
          'Tejido teñido en prenda, prelavado — aspecto refinado, forma duradera',
          'Cuello clásico con pespunte visto',
          'Refuerzo de sarga en cuello, hombros y cinta interior',
          'Puños de canalé con ajuste preciso',
          'Ajuste unisex cómodo y versátil'
        ]}
      ]
    }
  },

  /* ══════════════════════════════════════════════════════════
     ME-02-LE  —  LH-EST 001
  ══════════════════════════════════════════════════════════ */
  'ME-02-LE': {

    shortDesc: {
      it: 'Edizione numerata LH-EST 001. Cotone biologico certificato, design esclusivo con coordinate e rosa dei venti in oro antico. Tiratura limitata — quando finisce, non viene ristampata.',
      en: 'Numbered edition LH-EST 001. Certified organic cotton, exclusive design with coordinates and antique gold compass rose. Limited run — when it\'s gone, it won\'t be reprinted.',
      fr: 'Édition numérotée LH-EST 001. Coton biologique certifié, design exclusif avec coordonnées et rose des vents en or antique. Tirage limité — quand c\'est terminé, ça ne sera pas réimprimé.',
      de: 'Nummerierte Edition LH-EST 001. Zertifizierte Bio-Baumwolle, exklusives Design mit Koordinaten und Windrose in Antikgold. Limitierte Auflage — wenn vergriffen, wird sie nicht nachgedruckt.',
      es: 'Edición numerada LH-EST 001. Algodón orgánico certificado, diseño exclusivo con coordenadas y rosa de los vientos en oro antiguo. Tirada limitada — cuando se acaba, no se reimprime.'
    },

    longDesc: {
      it: [
        { type: 'single', text: 'Il tuo punto di partenza verso qualcosa di più grande.' },
        { type: 'para',   text: 'LH-EST 001 non è una semplice maglietta. È il primo pezzo di una collezione pensata per chi sa riconoscere il valore delle cose nel modo in cui si veste, nei luoghi che abita, nelle scelte che fa.' },
        { type: 'para',   text: 'Sul retro, le coordinate 45°49N | 7°22\'E segnano un punto preciso nel mondo. La rosa dei venti incisa in oro antico richiama l\'orientamento, la direzione, l\'intenzione. Il tutto su un fondo nero intenso che parla da solo.' },
        { type: 'divider' },
        { type: 'single', text: 'Indossarla è prendere posizione.' },
        { type: 'single-tight-bottom', text: 'Costruita per durare, progettata per distinguere.' },
        { type: 'para-tight-top', text: 'Realizzata in 100% cotone biologico ring-spun con grammatura da 180 g/m², questa t-shirt offre una vestibilità regular pulita e una mano morbida che migliora con ogni lavaggio. Non si restringe al primo utilizzo. Non perde forma con il tempo.' },
        { type: 'list', items: [
          '**Tessuto certificato GOTS e OCS** — cotone biologico verificato dalla filiera',
          '**Certificazione OEKO-TEX Standard 100** — nessuna sostanza nociva',
          '**Approvato come vegano da PETA**',
          'Collo a costine 1×1 rinforzato | Maniche riportate | Impunture a doppio ago',
          'Produzione controllata e tracciabile'
        ]},
        { type: 'divider' },
        { type: 'single', text: 'Edizione Limitata. Una volta esaurita, non torna.' },
        { type: 'para',   text: 'LH-EST 001 è il numero uno di una serie riservata a chi entra a far parte del mondo LuxHaven360 fin dall\'inizio. Non ci sono restock programmati. Non ci sono seconde opportunità.' },
        { type: 'size-note', text: '**Nota sulle taglie:** Se acquisti negli Stati Uniti, ti consigliamo di scegliere una taglia in più rispetto alla tua abituale.' }
      ],
      en: [
        { type: 'single', text: 'Your starting point towards something greater.' },
        { type: 'para',   text: 'LH-EST 001 is not just a T-shirt. It is the first piece of a collection created for those who recognise the value of things in the way they dress, the places they live, the choices they make.' },
        { type: 'para',   text: 'On the back, the coordinates 45°49N | 7°22\'E mark a precise point in the world. The compass rose etched in antique gold evokes orientation, direction, intention. All on an intense black background that speaks for itself.' },
        { type: 'divider' },
        { type: 'single', text: 'Wearing it means taking a stand.' },
        { type: 'single-tight-bottom', text: 'Built to last, designed to stand out.' },
        { type: 'para-tight-top', text: 'Made from 100% ring-spun organic cotton at 180 g/m², this T-shirt offers a clean regular fit and a soft hand that improves with every wash. It won\'t shrink on first wear. It won\'t lose its shape over time.' },
        { type: 'list', items: [
          '**GOTS and OCS certified fabric** — organically verified throughout the supply chain',
          '**OEKO-TEX Standard 100 certification** — no harmful substances',
          '**PETA approved vegan**',
          'Reinforced 1×1 ribbed crew neck | Set-in sleeves | Double-needle stitching',
          'Controlled and traceable production'
        ]},
        { type: 'divider' },
        { type: 'single', text: 'Limited Edition. Once it\'s gone, it won\'t come back.' },
        { type: 'para',   text: 'LH-EST 001 is the first in a series reserved for those who join the LuxHaven360 world from the very beginning. There are no planned restocks. There are no second chances.' },
        { type: 'size-note', text: '**Size note:** If purchasing in the United States, we recommend sizing up from your usual size.' }
      ],
      fr: [
        { type: 'single', text: 'Votre point de départ vers quelque chose de plus grand.' },
        { type: 'para',   text: 'LH-EST 001 n\'est pas un simple t-shirt. C\'est la première pièce d\'une collection pensée pour ceux qui reconnaissent la valeur des choses dans leur façon de s\'habiller, dans les lieux qu\'ils habitent, dans les choix qu\'ils font.' },
        { type: 'para',   text: 'Au dos, les coordonnées 45°49N | 7°22\'E marquent un point précis dans le monde. La rose des vents gravée en or antique évoque l\'orientation, la direction, l\'intention. Le tout sur un fond noir intense qui parle de lui-même.' },
        { type: 'divider' },
        { type: 'single', text: 'La porter, c\'est prendre position.' },
        { type: 'single-tight-bottom', text: 'Conçue pour durer, pensée pour se distinguer.' },
        { type: 'para-tight-top', text: 'Fabriqué en 100 % coton biologique filé en anneau avec une grammage de 180 g/m², ce t-shirt offre une coupe regular propre et une main douce qui s\'améliore à chaque lavage. Il ne rétrécit pas à la première utilisation. Il ne perd pas sa forme avec le temps.' },
        { type: 'list', items: [
          '**Tissu certifié GOTS et OCS** — coton biologique vérifié tout au long de la filière',
          '**Certification OEKO-TEX Standard 100** — aucune substance nocive',
          '**Approuvé vegan par PETA**',
          'Col côtelé 1×1 renforcé | Manches montées | Surpiqûres double aiguille',
          'Production contrôlée et traçable'
        ]},
        { type: 'divider' },
        { type: 'single', text: 'Édition Limitée. Une fois épuisée, elle ne reviendra pas.' },
        { type: 'para',   text: 'LH-EST 001 est le numéro un d\'une série réservée à ceux qui rejoignent le monde LuxHaven360 dès le début. Il n\'y a pas de réassorts prévus. Il n\'y a pas de deuxièmes chances.' },
        { type: 'size-note', text: '**Note sur les tailles :** Si vous achetez aux États-Unis, nous vous recommandons de choisir une taille au-dessus de votre taille habituelle.' }
      ],
      de: [
        { type: 'single', text: 'Dein Ausgangspunkt in Richtung etwas Größerem.' },
        { type: 'para',   text: 'LH-EST 001 ist nicht einfach ein T-Shirt. Es ist das erste Stück einer Kollektion, die für diejenigen geschaffen wurde, die den Wert der Dinge in der Art erkennen, wie sie sich kleiden, in den Orten, die sie bewohnen, in den Entscheidungen, die sie treffen.' },
        { type: 'para',   text: 'Auf der Rückseite markieren die Koordinaten 45°49N | 7°22\'E einen genauen Punkt auf der Welt. Die in Antikgold eingravierte Windrose evoziert Orientierung, Richtung, Absicht. Alles auf einem intensiven schwarzen Hintergrund, der für sich selbst spricht.' },
        { type: 'divider' },
        { type: 'single', text: 'Es zu tragen bedeutet, Stellung zu beziehen.' },
        { type: 'single-tight-bottom', text: 'Gebaut um zu dauern, entworfen um aufzufallen.' },
        { type: 'para-tight-top', text: 'Aus 100 % ringgesponnener Bio-Baumwolle mit 180 g/m² gefertigt, bietet dieses T-Shirt eine saubere Regular-Fit-Passform und eine weiche Haptik, die sich mit jedem Waschen verbessert. Es schrumpft nicht beim ersten Tragen. Es verliert seine Form nicht mit der Zeit.' },
        { type: 'list', items: [
          '**GOTS- und OCS-zertifizierter Stoff** — Bio-Baumwolle entlang der gesamten Lieferkette verifiziert',
          '**OEKO-TEX Standard 100 Zertifizierung** — keine Schadstoffe',
          '**Von PETA als vegan anerkannt**',
          'Verstärkter 1×1 Rippkragen | Angesetzte Ärmel | Doppelnadel-Nähte',
          'Kontrollierte und rückverfolgbare Produktion'
        ]},
        { type: 'divider' },
        { type: 'single', text: 'Limitierte Auflage. Wenn sie weg ist, kommt sie nicht wieder.' },
        { type: 'para',   text: 'LH-EST 001 ist die Nummer Eins einer Serie, die denjenigen vorbehalten ist, die von Anfang an Teil der LuxHaven360-Welt werden. Es gibt keine geplanten Nachbestellungen. Es gibt keine zweiten Chancen.' },
        { type: 'size-note', text: '**Hinweis zu Größen:** Beim Kauf in den Vereinigten Staaten empfehlen wir, eine Größe größer als Ihre gewöhnliche Größe zu wählen.' }
      ],
      es: [
        { type: 'single', text: 'Tu punto de partida hacia algo más grande.' },
        { type: 'para',   text: 'LH-EST 001 no es una simple camiseta. Es la primera pieza de una colección pensada para quienes reconocen el valor de las cosas en la forma en que se visten, en los lugares que habitan, en las elecciones que hacen.' },
        { type: 'para',   text: 'En la espalda, las coordenadas 45°49N | 7°22\'E marcan un punto preciso en el mundo. La rosa de los vientos grabada en oro antiguo evoca orientación, dirección, intención. Todo sobre un fondo negro intenso que habla por sí solo.' },
        { type: 'divider' },
        { type: 'single', text: 'Llevarla es tomar posición.' },
        { type: 'single-tight-bottom', text: 'Construida para durar, diseñada para distinguirse.' },
        { type: 'para-tight-top', text: 'Fabricada en 100 % algodón orgánico hilado en anillo con gramaje de 180 g/m², esta camiseta ofrece un ajuste regular limpio y una mano suave que mejora con cada lavado. No encoge en el primer uso. No pierde la forma con el tiempo.' },
        { type: 'list', items: [
          '**Tejido certificado GOTS y OCS** — algodón orgánico verificado en toda la cadena de suministro',
          '**Certificación OEKO-TEX Standard 100** — sin sustancias nocivas',
          '**Aprobado como vegano por PETA**',
          'Cuello acanalado 1×1 reforzado | Mangas montadas | Pespuntes de doble aguja',
          'Producción controlada y trazable'
        ]},
        { type: 'divider' },
        { type: 'single', text: 'Edición Limitada. Una vez agotada, no vuelve.' },
        { type: 'para',   text: 'LH-EST 001 es el número uno de una serie reservada a quienes se incorporan al mundo LuxHaven360 desde el principio. No hay reposiciones programadas. No hay segundas oportunidades.' },
        { type: 'size-note', text: '**Nota sobre las tallas:** Si compras en Estados Unidos, te recomendamos elegir una talla más de la que usas habitualmente.' }
      ]
    }
  },

  /* ══════════════════════════════════════════════════════════
     ME-02-A  —  Heritage Estates Tee
  ══════════════════════════════════════════════════════════ */
  'ME-02-A': {

    shortDesc: {
      it: 'Cotone pettinato al 100%, filato spesso e prelavato. La grafica Heritage Estates racconta un mondo fatto di scelte precise e dettagli che contano. Indossala una volta e capirai la differenza.',
      en: '100% combed cotton, thick-spun and pre-washed. The Heritage Estates graphic tells a world of precise choices and details that matter. Wear it once and you\'ll understand the difference.',
      fr: 'Coton peigné 100 %, filé épais et prélavé. Le graphisme Heritage Estates raconte un monde de choix précis et de détails qui comptent. Portez-le une fois et vous comprendrez la différence.',
      de: '100 % gekämmte Baumwolle, dick gesponnen und vorgewaschen. Die Heritage Estates Grafik erzählt von einer Welt präziser Entscheidungen und Details, die zählen. Trag sie einmal und du wirst den Unterschied verstehen.',
      es: 'Algodón peinado al 100 %, hilado grueso y prelavado. La gráfica Heritage Estates cuenta un mundo de elecciones precisas y detalles que importan. Úsala una vez y entenderás la diferencia.'
    },

    longDesc: {
      it: [
        { type: 'single', text: 'Alcune cose si riconoscono al primo tocco.' },
        { type: 'para',   text: 'La Heritage Estates Tee è la maglietta che porta con sé un\'identità precisa: quella di chi sa scegliere, sa distinguersi e non ha bisogno di urlarlo.' },
        { type: 'para',   text: 'La grafica Heritage Estates — con il suo stemma araldico, i leoni rampanti e il monogramma incastonato nello scudo — racconta il mondo LuxHaven360 in ogni dettaglio visivo.' },
        { type: 'para',   text: 'Realizzata in cotone pettinato 100%, filato a 28 capi per una consistenza densa e compatta, questa t-shirt ha una mano morbida fuori dal comune. Prelavata per preservare la forma nel tempo, nasce per essere indossata, lavata e indossata ancora, senza cedere, senza deformarsi.' },
        { type: 'para',   text: 'Il taglio regular fit con girocollo a coste si adatta a ogni corporatura con naturalezza, mentre le impunture a doppio ago su maniche e orlo garantiscono una tenuta impeccabile anche dopo un uso prolungato. La fettuccia interna da spalla a spalla completa una costruzione pensata per durare.' },
        { type: 'single', text: 'Non è solo una maglietta. È il pezzo di una collezione che racconta un mondo.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Dettagli tecnici:' },
        { type: 'list', items: [
          '100% cotone pettinato',
          'Grammatura: 150 g/m²',
          'Filato spesso a 28 capi',
          'Prelavata · Regular fit · Girocollo a coste',
          'Impunture a doppio ago · Fettuccia spalla-spalla',
          'Etichetta a strappo per massimo comfort'
        ]}
      ],
      en: [
        { type: 'single', text: 'Some things are recognised at first touch.' },
        { type: 'para',   text: 'The Heritage Estates Tee is the T-shirt that carries a precise identity: that of someone who knows how to choose, knows how to stand out, and doesn\'t need to shout it.' },
        { type: 'para',   text: 'The Heritage Estates graphic — with its heraldic crest, rampant lions and monogram set into the shield — tells the LuxHaven360 world in every visual detail.' },
        { type: 'para',   text: 'Made from 100% combed cotton, 28-ply spun for a dense and compact consistency, this T-shirt has an unusually soft hand. Pre-washed to preserve its shape over time, it is made to be worn, washed and worn again, without giving way, without losing its shape.' },
        { type: 'para',   text: 'The regular fit cut with ribbed crew neck adapts to every body type naturally, while the double-needle stitching on sleeves and hem ensures an impeccable hold even after extended use. The internal tape from shoulder to shoulder completes a construction designed to last.' },
        { type: 'single', text: 'It\'s not just a T-shirt. It\'s a piece of a collection that tells a world.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Technical details:' },
        { type: 'list', items: [
          '100% combed cotton',
          'Weight: 150 g/m²',
          '28-ply thick-spun',
          'Pre-washed · Regular fit · Ribbed crew neck',
          'Double-needle stitching · Shoulder-to-shoulder tape',
          'Tear-away label for maximum comfort'
        ]}
      ],
      fr: [
        { type: 'single', text: 'Certaines choses se reconnaissent au premier toucher.' },
        { type: 'para',   text: 'Le Heritage Estates Tee est le t-shirt qui porte avec lui une identité précise : celle de quelqu\'un qui sait choisir, sait se distinguer et n\'a pas besoin de le crier.' },
        { type: 'para',   text: 'Le graphisme Heritage Estates — avec ses armoiries héraldiques, ses lions rampants et son monogramme serti dans l\'écu — raconte le monde LuxHaven360 dans chaque détail visuel.' },
        { type: 'para',   text: 'Fabriqué en coton peigné 100 %, filé à 28 fils pour une consistance dense et compacte, ce t-shirt a une main d\'une douceur remarquable. Prélavé pour préserver la forme dans le temps, il est fait pour être porté, lavé et porté à nouveau, sans céder, sans se déformer.' },
        { type: 'para',   text: 'La coupe regular fit avec col rond côtelé s\'adapte naturellement à toute morphologie, tandis que les surpiqûres double aiguille sur les manches et l\'ourlet garantissent une tenue impeccable même après un usage prolongé. La fettuccia intérieure d\'épaule à épaule complète une construction pensée pour durer.' },
        { type: 'single', text: 'Ce n\'est pas qu\'un t-shirt. C\'est une pièce d\'une collection qui raconte un monde.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Détails techniques :' },
        { type: 'list', items: [
          '100 % coton peigné',
          'Grammage : 150 g/m²',
          'Filé épais à 28 fils',
          'Prélavé · Regular fit · Col rond côtelé',
          'Surpiqûres double aiguille · Fettuccia épaule-épaule',
          'Étiquette à déchirer pour un confort maximal'
        ]}
      ],
      de: [
        { type: 'single', text: 'Manche Dinge erkennt man beim ersten Berühren.' },
        { type: 'para',   text: 'Das Heritage Estates Tee ist das T-Shirt, das eine präzise Identität trägt: die von jemandem, der zu wählen weiß, sich abzuheben versteht und es nicht zu schreien braucht.' },
        { type: 'para',   text: 'Die Heritage Estates-Grafik — mit ihrem heraldischen Wappen, stehenden Löwen und dem im Schild eingefassten Monogramm — erzählt die Welt von LuxHaven360 in jedem visuellen Detail.' },
        { type: 'para',   text: 'Aus 100 % gekämmter Baumwolle, 28-fach gesponnen für eine dichte und kompakte Konsistenz, hat dieses T-Shirt eine ungewöhnlich weiche Haptik. Vorgewaschen, um die Form im Laufe der Zeit zu erhalten, ist es gemacht, um getragen, gewaschen und wieder getragen zu werden, ohne nachzugeben, ohne seine Form zu verlieren.' },
        { type: 'para',   text: 'Der Regular Fit Schnitt mit Rippkragen passt sich jedem Körpertyp auf natürliche Weise an, während die Doppelnadel-Nähte an Ärmeln und Saum eine tadellose Haltbarkeit auch nach längerem Gebrauch gewährleisten. Das innere Band von Schulter zu Schulter vervollständigt eine Konstruktion, die für die Langlebigkeit konzipiert wurde.' },
        { type: 'single', text: 'Es ist nicht nur ein T-Shirt. Es ist ein Stück einer Kollektion, die eine Welt erzählt.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Technische Details:' },
        { type: 'list', items: [
          '100 % gekämmte Baumwolle',
          'Gewicht: 150 g/m²',
          '28-fach dick gesponnen',
          'Vorgewaschen · Regular Fit · Rippkragen',
          'Doppelnadel-Nähte · Schulter-zu-Schulter-Band',
          'Abreißetikett für maximalen Komfort'
        ]}
      ],
      es: [
        { type: 'single', text: 'Algunas cosas se reconocen al primer toque.' },
        { type: 'para',   text: 'La Heritage Estates Tee es la camiseta que lleva consigo una identidad precisa: la de quien sabe elegir, sabe distinguirse y no necesita proclamarlo.' },
        { type: 'para',   text: 'La gráfica Heritage Estates — con su blasón heráldico, leones rampantes y monograma engastado en el escudo — cuenta el mundo LuxHaven360 en cada detalle visual.' },
        { type: 'para',   text: 'Fabricada en algodón peinado 100 %, hilado a 28 cabos para una consistencia densa y compacta, esta camiseta tiene una mano suave fuera de lo común. Prelavada para preservar la forma a lo largo del tiempo, está hecha para usarse, lavarse y usarse de nuevo, sin ceder, sin deformarse.' },
        { type: 'para',   text: 'El corte regular fit con cuello redondo acanalado se adapta a cada tipo de cuerpo con naturalidad, mientras que los pespuntes de doble aguja en mangas y dobladillo garantizan una sujeción impecable incluso tras un uso prolongado. La cinta interior de hombro a hombro completa una construcción pensada para durar.' },
        { type: 'single', text: 'No es solo una camiseta. Es la pieza de una colección que cuenta un mundo.' },
        { type: 'divider' },
        { type: 'list-header', text: 'Detalles técnicos:' },
        { type: 'list', items: [
          '100 % algodón peinado',
          'Gramaje: 150 g/m²',
          'Hilado grueso a 28 cabos',
          'Prelavada · Regular fit · Cuello redondo acanalado',
          'Pespuntes de doble aguja · Cinta hombro a hombro',
          'Etiqueta desprendible para máximo confort'
        ]}
      ]
    }
  }

  /*
   * ──────────────────────────────────────────────────────────
   *  AGGIUNGERE NUOVI PRODOTTI QUI:
   *
   *  'SKU-PRODOTTO': {
   *    shortDesc: { it: '...', en: '...', fr: '...', de: '...', es: '...' },
   *    longDesc:  { it: [ ...blocchi ], en: [ ...blocchi ], ... }
   *  },
   * ──────────────────────────────────────────────────────────
   */

};

// Esporta per uso globale
if (typeof window !== 'undefined') {
  window.translationsDescriptions = translationsDescriptions;
}

/* ============================================================
   TRADUZIONI ETICHETTE SPECIFICHE
   Traducono i nomi dei campi (Composizione, Peso, Origine,
   Vestibilità) e il titolo "Guida alle Taglie".
   Lingue: IT · EN · FR · DE · ES
   ============================================================ */
const translationsSpecLabels = {
  it: {
    spec_composition:  'Composizione',
    spec_weight:       'Peso',
    spec_origin:       'Origine',
    spec_fit:          'Vestibilità',
    size_guide_title:  'Guida alle Taglie'
  },
  en: {
    spec_composition:  'Composition',
    spec_weight:       'Weight',
    spec_origin:       'Origin',
    spec_fit:          'Fit',
    size_guide_title:  'Size Guide'
  },
  fr: {
    spec_composition:  'Composition',
    spec_weight:       'Poids',
    spec_origin:       'Origine',
    spec_fit:          'Coupe',
    size_guide_title:  'Guide des Tailles'
  },
  de: {
    spec_composition:  'Zusammensetzung',
    spec_weight:       'Gewicht',
    spec_origin:       'Herkunft',
    spec_fit:          'Passform',
    size_guide_title:  'Größentabelle'
  },
  es: {
    spec_composition:  'Composición',
    spec_weight:       'Peso',
    spec_origin:       'Origen',
    spec_fit:          'Ajuste',
    size_guide_title:  'Guía de Tallas'
  }
};

if (typeof window !== 'undefined') {
  window.translationsSpecLabels = translationsSpecLabels;
}

/* ============================================================
   TRADUZIONI COLONNE TABELLA TAGLIE — per SKU
   Il backend invia sempre: taglia · petto · vita · lunghezza.
   Qui definiamo come intestare quei campi per ogni prodotto.
   _default è usato per qualsiasi SKU non elencato.
   ============================================================ */
const translationsSpecColumns = {

  /* ── ME-01-LE  (Vault Keys Hoodie)
     H = ½ Petto · I = Lunghezza · J = Lunghezza Maniche        */
  'ME-01-LE': {
    it: { taglia: 'Taglia',  petto: '½ Petto (cm)',        vita: 'Lunghezza (cm)',        lunghezza: 'Lunghezza Maniche (cm)' },
    en: { taglia: 'Size',    petto: '½ Chest (cm)',         vita: 'Length (cm)',           lunghezza: 'Sleeve Length (cm)'    },
    fr: { taglia: 'Taille',  petto: '½ Poitrine (cm)',      vita: 'Longueur (cm)',         lunghezza: 'Longueur Manches (cm)' },
    de: { taglia: 'Größe',   petto: '½ Brust (cm)',         vita: 'Länge (cm)',            lunghezza: 'Ärmellänge (cm)'       },
    es: { taglia: 'Talla',   petto: '½ Pecho (cm)',         vita: 'Largo (cm)',            lunghezza: 'Largo Mangas (cm)'     }
  },

  /* ── ME-01-L&A  (Signature Cap)
     H = Circonferenza · I = Altezza Calotta · J = Larghezza Visiera */
  'ME-01-L&A': {
    it: { taglia: 'Taglia',  petto: 'Circonferenza (cm)',  vita: 'Altezza Calotta (cm)',  lunghezza: 'Larghezza Visiera (cm)'  },
    en: { taglia: 'Size',    petto: 'Circumference (cm)',  vita: 'Crown Height (cm)',      lunghezza: 'Visor Width (cm)'        },
    fr: { taglia: 'Taille',  petto: 'Circonférence (cm)',  vita: 'Hauteur Calotte (cm)',   lunghezza: 'Largeur Visière (cm)'    },
    de: { taglia: 'Größe',   petto: 'Kopfumfang (cm)',     vita: 'Kronenhöhe (cm)',        lunghezza: 'Schirmbreite (cm)'       },
    es: { taglia: 'Talla',   petto: 'Circunferencia (cm)', vita: 'Altura Copa (cm)',       lunghezza: 'Ancho Visera (cm)'       }
  },

  /* ── ME-01-A  (Signature Long Sleeve — Comfort Colors)
     H = Lunghezza · I = Larghezza · J = Lunghezza Maniche       */
  'ME-01-A': {
    it: { taglia: 'Taglia',  petto: 'Lunghezza (cm)',      vita: 'Larghezza (cm)',         lunghezza: 'Lunghezza Maniche (cm)' },
    en: { taglia: 'Size',    petto: 'Length (cm)',          vita: 'Width (cm)',             lunghezza: 'Sleeve Length (cm)'     },
    fr: { taglia: 'Taille',  petto: 'Longueur (cm)',        vita: 'Largeur (cm)',           lunghezza: 'Longueur Manches (cm)'  },
    de: { taglia: 'Größe',   petto: 'Länge (cm)',           vita: 'Breite (cm)',            lunghezza: 'Ärmellänge (cm)'        },
    es: { taglia: 'Talla',   petto: 'Largo (cm)',           vita: 'Ancho (cm)',             lunghezza: 'Largo Mangas (cm)'      }
  },

  /* ── ME-02-LE  (LH-EST 001 — Stanley/Stella Organic Tee)
     H = Lunghezza · I = Larghezza · J = Lunghezza Maniche       */
  'ME-02-LE': {
    it: { taglia: 'Taglia',  petto: 'Lunghezza (cm)',      vita: 'Larghezza (cm)',         lunghezza: 'Lunghezza Maniche (cm)' },
    en: { taglia: 'Size',    petto: 'Length (cm)',          vita: 'Width (cm)',             lunghezza: 'Sleeve Length (cm)'     },
    fr: { taglia: 'Taille',  petto: 'Longueur (cm)',        vita: 'Largeur (cm)',           lunghezza: 'Longueur Manches (cm)'  },
    de: { taglia: 'Größe',   petto: 'Länge (cm)',           vita: 'Breite (cm)',            lunghezza: 'Ärmellänge (cm)'        },
    es: { taglia: 'Talla',   petto: 'Largo (cm)',           vita: 'Ancho (cm)',             lunghezza: 'Largo Mangas (cm)'      }
  },

  /* ── ME-02-A  (Heritage Estates Tee — AS Colour)
     H = Lunghezza · I = Larghezza  (J vuoto)                   */
  'ME-02-A': {
    it: { taglia: 'Taglia',  petto: 'Lunghezza (cm)',      vita: 'Larghezza (cm)',         lunghezza: '' },
    en: { taglia: 'Size',    petto: 'Length (cm)',          vita: 'Width (cm)',             lunghezza: '' },
    fr: { taglia: 'Taille',  petto: 'Longueur (cm)',        vita: 'Largeur (cm)',           lunghezza: '' },
    de: { taglia: 'Größe',   petto: 'Länge (cm)',           vita: 'Breite (cm)',            lunghezza: '' },
    es: { taglia: 'Talla',   petto: 'Largo (cm)',           vita: 'Ancho (cm)',             lunghezza: '' }
  },

  /* ── Default (qualsiasi SKU non listato sopra) ── */
  '_default': {
    it: { taglia: 'Taglia',  petto: 'Petto (cm)',          vita: 'Vita (cm)',              lunghezza: 'Lunghezza (cm)' },
    en: { taglia: 'Size',    petto: 'Chest (cm)',           vita: 'Waist (cm)',             lunghezza: 'Length (cm)'    },
    fr: { taglia: 'Taille',  petto: 'Poitrine (cm)',        vita: 'Tour de taille (cm)',    lunghezza: 'Longueur (cm)'  },
    de: { taglia: 'Größe',   petto: 'Brust (cm)',           vita: 'Taille (cm)',            lunghezza: 'Länge (cm)'     },
    es: { taglia: 'Talla',   petto: 'Pecho (cm)',           vita: 'Cintura (cm)',           lunghezza: 'Largo (cm)'     }
  }

};

if (typeof window !== 'undefined') {
  window.translationsSpecColumns = translationsSpecColumns;
}

/* ============================================================
   TRADUZIONI VALORI SPECIFICHE
   I valori di Origine e Vestibilità sono salvati in italiano
   nel foglio Google. Qui definiamo le loro traduzioni.
   CHIAVE = valore italiano esatto come scritto nel foglio.
   ============================================================ */
const translationsSpecValues = {

  /* ── Composizione ── */
  '95% poliestere riciclato, 5% spandex': {
    en: '95% recycled polyester, 5% spandex',
    fr: '95 % polyester recyclé, 5 % spandex',
    de: '95 % recyceltes Polyester, 5 % Spandex',
    es: '95 % poliéster reciclado, 5 % spandex'
  },
  '100% twill di chino di cotone': {
    en: '100% cotton chino twill',
    fr: '100 % twill de chino en coton',
    de: '100 % Baumwoll-Chino-Twill',
    es: '100 % sarga de chino de algodón'
  },
  '100% cotone morbido filato ad anello': {
    en: '100% soft ring-spun cotton',
    fr: '100 % coton doux filé en anneau',
    de: '100 % weiches ringgesponnenes Baumwolle',
    es: '100 % algodón suave hilado en anillo'
  },
  '100% cotone ring-spun biologico': {
    en: '100% organic ring-spun cotton',
    fr: '100 % coton biologique filé en anneau',
    de: '100 % biologisch ringgesponnene Baumwolle',
    es: '100 % algodón orgánico hilado en anillo'
  },
  '100% cotone pettinato': {
    en: '100% combed cotton',
    fr: '100 % coton peigné',
    de: '100 % gekämmte Baumwolle',
    es: '100 % algodón peinado'
  },

  /* ── Vestibilità ── */
  'Rilassata, unisex': {
    en: 'Relaxed, unisex',
    fr: 'Décontracté, unisexe',
    de: 'Entspannt, unisex',
    es: 'Holgado, unisex'
  },
  'Comoda, unisex': {
    en: 'Comfortable, unisex',
    fr: 'Confortable, unisexe',
    de: 'Bequem, unisex',
    es: 'Cómodo, unisex'
  },
  'Regular fit': {
    en: 'Regular fit',
    fr: 'Coupe classique',
    de: 'Regular Fit',
    es: 'Ajuste regular'
  },
  'Strutturata, taglia unica regolabile': {
    en: 'Structured, one-size adjustable',
    fr: 'Structurée, taille unique réglable',
    de: 'Strukturiert, verstellbare Einheitsgröße',
    es: 'Estructurada, talla única ajustable'
  },

  /* ── Origine ── */
  'Produzione Internazionale':  { en: 'International Production',  fr: 'Production Internationale',  de: 'Internationale Produktion',  es: 'Producción Internacional'  },
  'Manifattura Internazionale': { en: 'International Manufacture', fr: 'Manufacture Internationale', de: 'Internationale Herstellung', es: 'Manufactura Internacional' },
  'Cina':                  { en: 'China',               fr: 'Chine',                de: 'China',                  es: 'China'                 },
  'Messico':               { en: 'Mexico',              fr: 'Mexique',              de: 'Mexiko',                 es: 'México'                },
  'Cina o Messico':        { en: 'China or Mexico',     fr: 'Chine ou Mexique',     de: 'China oder Mexiko',      es: 'China o México'        },
  'Honduras':              { en: 'Honduras',            fr: 'Honduras',             de: 'Honduras',               es: 'Honduras'              },
  'Bangladesh':            { en: 'Bangladesh',          fr: 'Bangladesh',           de: 'Bangladesch',            es: 'Bangladesh'            },
  'Vietnam o Bangladesh':  { en: 'Vietnam or Bangladesh', fr: 'Vietnam ou Bangladesh', de: 'Vietnam oder Bangladesch', es: 'Vietnam o Bangladesh' },

  /* ── Taglia Unica (valore colonna G del foglio) ── */
  'Unica':       { en: 'One Size',  fr: 'Taille Unique',  de: 'Einheitsgröße',  es: 'Talla Única' },
  'Taglia Unica':{ en: 'One Size',  fr: 'Taille Unique',  de: 'Einheitsgröße',  es: 'Talla Única' }

};

if (typeof window !== 'undefined') {
  window.translationsSpecValues = translationsSpecValues;
}

/* ============================================================
   TRADUZIONI COLORI — usate in cart.html e success.html
   Chiave = nome italiano del colore (così come salvato nel carrello)
   Lingue: IT · EN · FR · DE · ES
   ============================================================ */

const translationsColors = {

  // ── Neutri ──────────────────────────────────────────────
  'Nero':           { it: 'Nero',           en: 'Black',          fr: 'Noir',           de: 'Schwarz',        es: 'Negro'           },
  'Bianco':         { it: 'Bianco',         en: 'White',          fr: 'Blanc',          de: 'Weiß',           es: 'Blanco'          },
  'Bianco Sporco':  { it: 'Bianco Sporco',  en: 'Off-White',      fr: 'Blanc Cassé',    de: 'Gebrochenes Weiß', es: 'Blanco Roto'   },
  'Écru':           { it: 'Écru',           en: 'Écru',           fr: 'Écru',           de: 'Ecru',           es: 'Crudo'           },
  'Panna':          { it: 'Panna',          en: 'Cream',          fr: 'Crème',          de: 'Cremefarben',    es: 'Crema'           },
  'Grigio':         { it: 'Grigio',         en: 'Grey',           fr: 'Gris',           de: 'Grau',           es: 'Gris'            },
  'Grigio Chiaro':  { it: 'Grigio Chiaro',  en: 'Light Grey',     fr: 'Gris Clair',     de: 'Hellgrau',       es: 'Gris Claro'      },
  'Grigio Scuro':   { it: 'Grigio Scuro',   en: 'Dark Grey',      fr: 'Gris Foncé',     de: 'Dunkelgrau',     es: 'Gris Oscuro'     },
  'Antracite':      { it: 'Antracite',      en: 'Anthracite',     fr: 'Anthracite',     de: 'Anthrazit',      es: 'Antracita'       },
  'Grafite':        { it: 'Grafite',        en: 'Graphite',       fr: 'Graphite',       de: 'Graphit',        es: 'Grafito'         },

  // ── Blu ─────────────────────────────────────────────────
  'Blu':            { it: 'Blu',            en: 'Blue',           fr: 'Bleu',           de: 'Blau',           es: 'Azul'            },
  'Blu Scuro':      { it: 'Blu Scuro',      en: 'Dark Blue',      fr: 'Bleu Foncé',     de: 'Dunkelblau',     es: 'Azul Oscuro'     },
  'Blu Reale':      { it: 'Blu Reale',      en: 'Royal Blue',     fr: 'Bleu Royal',     de: 'Königsblau',     es: 'Azul Real'       },
  'Blu Navy':       { it: 'Blu Navy',       en: 'Navy Blue',      fr: 'Bleu Marine',    de: 'Marineblau',     es: 'Azul Marino'     },
  'Blu Navy Scuro': { it: 'Blu Navy Scuro', en: 'Dark Navy',      fr: 'Marine Foncé',   de: 'Dunkles Marine', es: 'Navy Oscuro'     },
  'Celeste':        { it: 'Celeste',        en: 'Sky Blue',       fr: 'Bleu Ciel',      de: 'Himmelblau',     es: 'Azul Cielo'      },
  'Turchese':       { it: 'Turchese',       en: 'Turquoise',      fr: 'Turquoise',      de: 'Türkis',         es: 'Turquesa'        },
  'Petrolio':       { it: 'Petrolio',       en: 'Teal',           fr: 'Pétrole',        de: 'Petrol',         es: 'Verde Azulado'   },

  // ── Rosso / Rosa ────────────────────────────────────────
  'Rosso':          { it: 'Rosso',          en: 'Red',            fr: 'Rouge',          de: 'Rot',            es: 'Rojo'            },
  'Rosso Scuro':    { it: 'Rosso Scuro',    en: 'Dark Red',       fr: 'Rouge Foncé',    de: 'Dunkelrot',      es: 'Rojo Oscuro'     },
  'Bordeaux':       { it: 'Bordeaux',       en: 'Bordeaux',       fr: 'Bordeaux',       de: 'Bordeaux',       es: 'Burdeos'         },
  'Rosa':           { it: 'Rosa',           en: 'Pink',           fr: 'Rose',           de: 'Rosa',           es: 'Rosa'            },
  'Rosa Antico':    { it: 'Rosa Antico',    en: 'Dusty Rose',     fr: 'Vieux Rose',     de: 'Altrosa',        es: 'Rosa Antiguo'    },
  'Corallo':        { it: 'Corallo',        en: 'Coral',          fr: 'Corail',         de: 'Koralle',        es: 'Coral'           },
  'Fucsia':         { it: 'Fucsia',         en: 'Fuchsia',        fr: 'Fuchsia',        de: 'Fuchsia',        es: 'Fucsia'          },

  // ── Verde ────────────────────────────────────────────────
  'Verde':          { it: 'Verde',          en: 'Green',          fr: 'Vert',           de: 'Grün',           es: 'Verde'           },
  'Verde Chiaro':   { it: 'Verde Chiaro',   en: 'Light Green',    fr: 'Vert Clair',     de: 'Hellgrün',       es: 'Verde Claro'     },
  'Verde Scuro':    { it: 'Verde Scuro',    en: 'Dark Green',     fr: 'Vert Foncé',     de: 'Dunkelgrün',     es: 'Verde Oscuro'    },
  'Verde Oliva':    { it: 'Verde Oliva',    en: 'Olive Green',    fr: 'Vert Olive',     de: 'Olivgrün',       es: 'Verde Oliva'     },
  'Verde Bosco':    { it: 'Verde Bosco',    en: 'Forest Green',   fr: 'Vert Forêt',     de: 'Waldgrün',       es: 'Verde Bosque'    },
  'Verde Militare': { it: 'Verde Militare', en: 'Military Green', fr: 'Vert Militaire', de: 'Militärgrün',    es: 'Verde Militar'   },
  'Menta':          { it: 'Menta',          en: 'Mint',           fr: 'Menthe',         de: 'Minzgrün',       es: 'Menta'           },
  'Salvia':         { it: 'Salvia',         en: 'Sage',           fr: 'Sauge',          de: 'Salbeigrün',     es: 'Salvia'          },

  // ── Giallo / Arancione ───────────────────────────────────
  'Giallo':         { it: 'Giallo',         en: 'Yellow',         fr: 'Jaune',          de: 'Gelb',           es: 'Amarillo'        },
  'Giallo Ocra':    { it: 'Giallo Ocra',    en: 'Ochre Yellow',   fr: 'Jaune Ocre',     de: 'Ockergelb',      es: 'Amarillo Ocre'   },
  'Giallo Senape':  { it: 'Giallo Senape',  en: 'Mustard',        fr: 'Moutarde',       de: 'Senfgelb',       es: 'Mostaza'         },
  'Arancione':      { it: 'Arancione',      en: 'Orange',         fr: 'Orange',         de: 'Orange',         es: 'Naranja'         },
  'Arancione Bruciato': { it: 'Arancione Bruciato', en: 'Burnt Orange', fr: 'Orange Brûlé', de: 'Verbranntes Orange', es: 'Naranja Quemado' },

  // ── Viola / Lilla ────────────────────────────────────────
  'Viola':          { it: 'Viola',          en: 'Purple',         fr: 'Violet',         de: 'Lila',           es: 'Morado'          },
  'Viola Scuro':    { it: 'Viola Scuro',    en: 'Dark Purple',    fr: 'Violet Foncé',   de: 'Dunkellila',     es: 'Morado Oscuro'   },
  'Lilla':          { it: 'Lilla',          en: 'Lilac',          fr: 'Lilas',          de: 'Flieder',        es: 'Lila'            },
  'Lavanda':        { it: 'Lavanda',        en: 'Lavender',       fr: 'Lavande',        de: 'Lavendel',       es: 'Lavanda'         },

  // ── Marrone / Neutri caldi ───────────────────────────────
  'Marrone':        { it: 'Marrone',        en: 'Brown',          fr: 'Marron',         de: 'Braun',          es: 'Marrón'          },
  'Marrone Scuro':  { it: 'Marrone Scuro',  en: 'Dark Brown',     fr: 'Marron Foncé',   de: 'Dunkelbraun',    es: 'Marrón Oscuro'   },
  'Camel':          { it: 'Camel',          en: 'Camel',          fr: 'Camel',          de: 'Kamel',          es: 'Camello'         },
  'Cammello':       { it: 'Cammello',       en: 'Camel',          fr: 'Camel',          de: 'Kamel',          es: 'Camello'         },
  'Beige':          { it: 'Beige',          en: 'Beige',          fr: 'Beige',          de: 'Beige',          es: 'Beige'           },
  'Sabbia':         { it: 'Sabbia',         en: 'Sand',           fr: 'Sable',          de: 'Sand',           es: 'Arena'           },
  'Terracotta':     { it: 'Terracotta',     en: 'Terracotta',     fr: 'Terre Cuite',    de: 'Terrakotta',     es: 'Terracota'       },
  'Ruggine':        { it: 'Ruggine',        en: 'Rust',           fr: 'Rouille',        de: 'Rost',           es: 'Óxido'           },

  // ── Metallici ────────────────────────────────────────────
  'Oro':            { it: 'Oro',            en: 'Gold',           fr: 'Or',             de: 'Gold',           es: 'Oro'             },
  'Oro Antico':     { it: 'Oro Antico',     en: 'Antique Gold',   fr: 'Or Antique',     de: 'Antikgold',      es: 'Oro Antiguo'     },
  'Argento':        { it: 'Argento',        en: 'Silver',         fr: 'Argent',         de: 'Silber',         es: 'Plata'           },
  'Bronzo':         { it: 'Bronzo',         en: 'Bronze',         fr: 'Bronze',         de: 'Bronze',         es: 'Bronce'          },
  'Rame':           { it: 'Rame',           en: 'Copper',         fr: 'Cuivre',         de: 'Kupfer',         es: 'Cobre'           },

};

/**
 * Traduce il nome di un colore dalla lingua italiana alla lingua corrente.
 * Usata in cart.html e success.html per tradurre item.color.
 *
 * @param {string} colorIT    - Nome del colore in italiano (come salvato nel carrello)
 * @param {string} targetLang - Codice lingua destinazione ('it','en','fr','de','es')
 * @returns {string}          - Nome tradotto, o il valore originale se non trovato
 */
function translateColorName(colorIT, targetLang) {
  if (!colorIT) return '';
  const entry = translationsColors[colorIT];
  if (!entry) return colorIT; // colore non in dizionario: restituisce invariato
  return entry[targetLang] || entry['it'] || colorIT;
}

// ============================================================
//  Traduzioni taglie speciali
//  Chiave = valore italiano canonico (come salvato nel carrello/DB)
// ============================================================
const translationsSizes = {
  //         short = usato sul sito (solo il nome della taglia)
  //         full  = usato in email e checkout Stripe (etichetta completa)
  'Unica': {
    short: { it: 'Unica',        en: 'One Size', fr: 'Unique',        de: 'Einheitsgröße', es: 'Única'       },
    full:  { it: 'Taglia Unica', en: 'One Size', fr: 'Taille Unique', de: 'Einheitsgröße', es: 'Talla Única' }
  }
};

/**
 * Traduce il nome di una taglia dalla lingua italiana alla lingua corrente.
 * Usata in pdp-products.html, cart.html, success.html per tradurre item.size.
 *
 * @param {string} sizeIT     - Nome della taglia in italiano (come salvato nel carrello)
 * @param {string} targetLang - Codice lingua destinazione ('it','en','fr','de','es')
 * @param {string} [form]     - 'short' (default, per il sito) | 'full' (per email/Stripe)
 * @returns {string}          - Nome tradotto, o il valore originale se non trovato
 */
function translateSizeName(sizeIT, targetLang, form) {
  if (!sizeIT) return '';
  const entry = translationsSizes[sizeIT];
  if (!entry) return sizeIT; // taglia non in dizionario: restituisce invariata
  const variant = entry[form === 'full' ? 'full' : 'short'];
  if (!variant) return sizeIT;
  return variant[targetLang] || variant['it'] || sizeIT;
}

// Esporta per uso globale
if (typeof window !== 'undefined') {
  window.translationsColors    = translationsColors;
  window.translateColorName    = translateColorName;
  window.translationsSizes     = translationsSizes;
  window.translateSizeName     = translateSizeName;
}

/* ============================================================
   TRADUZIONI PAESI DEL MONDO (ISO 3166-1 alpha-2)
   Lingue supportate: IT · EN · FR · DE · ES
   ============================================================ */

const translationsCountries = {
  'AF': { it: 'Afghanistan', en: 'Afghanistan', fr: 'Afghanistan', de: 'Afghanistan', es: 'Afganistán' },
  'AX': { it: 'Isole Åland', en: 'Åland Islands', fr: 'Îles Åland', de: 'Ålandinseln', es: 'Islas Åland' },
  'AL': { it: 'Albania', en: 'Albania', fr: 'Albanie', de: 'Albanien', es: 'Albania' },
  'DZ': { it: 'Algeria', en: 'Algeria', fr: 'Algérie', de: 'Algerien', es: 'Argelia' },
  'AS': { it: 'Samoa Americane', en: 'American Samoa', fr: 'Samoa américaines', de: 'Amerikanisch-Samoa', es: 'Samoa Americana' },
  'AD': { it: 'Andorra', en: 'Andorra', fr: 'Andorre', de: 'Andorra', es: 'Andorra' },
  'AO': { it: 'Angola', en: 'Angola', fr: 'Angola', de: 'Angola', es: 'Angola' },
  'AI': { it: 'Anguilla', en: 'Anguilla', fr: 'Anguilla', de: 'Anguilla', es: 'Anguila' },
  'AQ': { it: 'Antartide', en: 'Antarctica', fr: 'Antarctique', de: 'Antarktis', es: 'Antártida' },
  'AG': { it: 'Antigua e Barbuda', en: 'Antigua and Barbuda', fr: 'Antigua-et-Barbuda', de: 'Antigua und Barbuda', es: 'Antigua y Barbuda' },
  'AR': { it: 'Argentina', en: 'Argentina', fr: 'Argentine', de: 'Argentinien', es: 'Argentina' },
  'AM': { it: 'Armenia', en: 'Armenia', fr: 'Arménie', de: 'Armenien', es: 'Armenia' },
  'AW': { it: 'Aruba', en: 'Aruba', fr: 'Aruba', de: 'Aruba', es: 'Aruba' },
  'AU': { it: 'Australia', en: 'Australia', fr: 'Australie', de: 'Australien', es: 'Australia' },
  'AT': { it: 'Austria', en: 'Austria', fr: 'Autriche', de: 'Österreich', es: 'Austria' },
  'AZ': { it: 'Azerbaigian', en: 'Azerbaijan', fr: 'Azerbaïdjan', de: 'Aserbaidschan', es: 'Azerbaiyán' },
  'BS': { it: 'Bahamas', en: 'Bahamas', fr: 'Bahamas', de: 'Bahamas', es: 'Bahamas' },
  'BH': { it: 'Bahrein', en: 'Bahrain', fr: 'Bahreïn', de: 'Bahrain', es: 'Baréin' },
  'BD': { it: 'Bangladesh', en: 'Bangladesh', fr: 'Bangladesh', de: 'Bangladesch', es: 'Bangladés' },
  'BB': { it: 'Barbados', en: 'Barbados', fr: 'Barbade', de: 'Barbados', es: 'Barbados' },
  'BY': { it: 'Bielorussia', en: 'Belarus', fr: 'Biélorussie', de: 'Belarus', es: 'Bielorrusia' },
  'BE': { it: 'Belgio', en: 'Belgium', fr: 'Belgique', de: 'Belgien', es: 'Bélgica' },
  'BZ': { it: 'Belize', en: 'Belize', fr: 'Belize', de: 'Belize', es: 'Belice' },
  'BJ': { it: 'Benin', en: 'Benin', fr: 'Bénin', de: 'Benin', es: 'Benín' },
  'BM': { it: 'Bermuda', en: 'Bermuda', fr: 'Bermudes', de: 'Bermuda', es: 'Bermudas' },
  'BT': { it: 'Bhutan', en: 'Bhutan', fr: 'Bhoutan', de: 'Bhutan', es: 'Bután' },
  'BO': { it: 'Bolivia', en: 'Bolivia', fr: 'Bolivie', de: 'Bolivien', es: 'Bolivia' },
  'BQ': { it: 'Caraibi Olandesi', en: 'Caribbean Netherlands', fr: 'Pays-Bas caribéens', de: 'Karibische Niederlande', es: 'Países Bajos Caribeños' },
  'BA': { it: 'Bosnia ed Erzegovina', en: 'Bosnia and Herzegovina', fr: 'Bosnie-Herzégovine', de: 'Bosnien und Herzegowina', es: 'Bosnia y Herzegovina' },
  'BW': { it: 'Botswana', en: 'Botswana', fr: 'Botswana', de: 'Botswana', es: 'Botsuana' },
  'BV': { it: 'Isola Bouvet', en: 'Bouvet Island', fr: 'Île Bouvet', de: 'Bouvetinsel', es: 'Isla Bouvet' },
  'BR': { it: 'Brasile', en: 'Brazil', fr: 'Brésil', de: 'Brasilien', es: 'Brasil' },
  'IO': { it: 'Territorio Britannico dell\'Oceano Indiano', en: 'British Indian Ocean Territory', fr: 'Territoire britannique de l\'Océan Indien', de: 'Britisches Territorium im Indischen Ozean', es: 'Territorio Británico del Océano Índico' },
  'BN': { it: 'Brunei', en: 'Brunei', fr: 'Brunéi', de: 'Brunei', es: 'Brunéi' },
  'BG': { it: 'Bulgaria', en: 'Bulgaria', fr: 'Bulgarie', de: 'Bulgarien', es: 'Bulgaria' },
  'BF': { it: 'Burkina Faso', en: 'Burkina Faso', fr: 'Burkina Faso', de: 'Burkina Faso', es: 'Burkina Faso' },
  'BI': { it: 'Burundi', en: 'Burundi', fr: 'Burundi', de: 'Burundi', es: 'Burundi' },
  'CV': { it: 'Capo Verde', en: 'Cape Verde', fr: 'Cap-Vert', de: 'Kap Verde', es: 'Cabo Verde' },
  'KH': { it: 'Cambogia', en: 'Cambodia', fr: 'Cambodge', de: 'Kambodscha', es: 'Camboya' },
  'CM': { it: 'Camerun', en: 'Cameroon', fr: 'Cameroun', de: 'Kamerun', es: 'Camerún' },
  'CA': { it: 'Canada', en: 'Canada', fr: 'Canada', de: 'Kanada', es: 'Canadá' },
  'KY': { it: 'Isole Cayman', en: 'Cayman Islands', fr: 'Îles Caïmans', de: 'Kaimaninseln', es: 'Islas Caimán' },
  'CF': { it: 'Repubblica Centrafricana', en: 'Central African Republic', fr: 'République centrafricaine', de: 'Zentralafrikanische Republik', es: 'República Centroafricana' },
  'TD': { it: 'Ciad', en: 'Chad', fr: 'Tchad', de: 'Tschad', es: 'Chad' },
  'CL': { it: 'Cile', en: 'Chile', fr: 'Chili', de: 'Chile', es: 'Chile' },
  'CN': { it: 'Cina', en: 'China', fr: 'Chine', de: 'China', es: 'China' },
  'CX': { it: 'Isola Christmas', en: 'Christmas Island', fr: 'Île Christmas', de: 'Weihnachtsinsel', es: 'Isla de Navidad' },
  'CC': { it: 'Isole Cocos', en: 'Cocos (Keeling) Islands', fr: 'Îles Cocos', de: 'Kokosinseln', es: 'Islas Cocos' },
  'CO': { it: 'Colombia', en: 'Colombia', fr: 'Colombie', de: 'Kolumbien', es: 'Colombia' },
  'KM': { it: 'Comore', en: 'Comoros', fr: 'Comores', de: 'Komoren', es: 'Comoras' },
  'CG': { it: 'Repubblica del Congo', en: 'Republic of the Congo', fr: 'République du Congo', de: 'Republik Kongo', es: 'República del Congo' },
  'CD': { it: 'Repubblica Democratica del Congo', en: 'Democratic Republic of the Congo', fr: 'République démocratique du Congo', de: 'Demokratische Republik Kongo', es: 'República Democrática del Congo' },
  'CK': { it: 'Isole Cook', en: 'Cook Islands', fr: 'Îles Cook', de: 'Cookinseln', es: 'Islas Cook' },
  'CR': { it: 'Costa Rica', en: 'Costa Rica', fr: 'Costa Rica', de: 'Costa Rica', es: 'Costa Rica' },
  'CI': { it: 'Costa d\'Avorio', en: 'Ivory Coast', fr: 'Côte d\'Ivoire', de: 'Elfenbeinküste', es: 'Costa de Marfil' },
  'HR': { it: 'Croazia', en: 'Croatia', fr: 'Croatie', de: 'Kroatien', es: 'Croacia' },
  'CU': { it: 'Cuba', en: 'Cuba', fr: 'Cuba', de: 'Kuba', es: 'Cuba' },
  'CW': { it: 'Curaçao', en: 'Curaçao', fr: 'Curaçao', de: 'Curaçao', es: 'Curazao' },
  'CY': { it: 'Cipro', en: 'Cyprus', fr: 'Chypre', de: 'Zypern', es: 'Chipre' },
  'CZ': { it: 'Repubblica Ceca', en: 'Czech Republic', fr: 'République tchèque', de: 'Tschechien', es: 'República Checa' },
  'DK': { it: 'Danimarca', en: 'Denmark', fr: 'Danemark', de: 'Dänemark', es: 'Dinamarca' },
  'DJ': { it: 'Gibuti', en: 'Djibouti', fr: 'Djibouti', de: 'Dschibuti', es: 'Yibuti' },
  'DM': { it: 'Dominica', en: 'Dominica', fr: 'Dominique', de: 'Dominica', es: 'Dominica' },
  'DO': { it: 'Repubblica Dominicana', en: 'Dominican Republic', fr: 'République dominicaine', de: 'Dominikanische Republik', es: 'República Dominicana' },
  'EC': { it: 'Ecuador', en: 'Ecuador', fr: 'Équateur', de: 'Ecuador', es: 'Ecuador' },
  'EG': { it: 'Egitto', en: 'Egypt', fr: 'Égypte', de: 'Ägypten', es: 'Egipto' },
  'SV': { it: 'El Salvador', en: 'El Salvador', fr: 'Salvador', de: 'El Salvador', es: 'El Salvador' },
  'GQ': { it: 'Guinea Equatoriale', en: 'Equatorial Guinea', fr: 'Guinée équatoriale', de: 'Äquatorialguinea', es: 'Guinea Ecuatorial' },
  'ER': { it: 'Eritrea', en: 'Eritrea', fr: 'Érythrée', de: 'Eritrea', es: 'Eritrea' },
  'EE': { it: 'Estonia', en: 'Estonia', fr: 'Estonie', de: 'Estland', es: 'Estonia' },
  'SZ': { it: 'Eswatini', en: 'Eswatini', fr: 'Eswatini', de: 'Eswatini', es: 'Esuatini' },
  'ET': { it: 'Etiopia', en: 'Ethiopia', fr: 'Éthiopie', de: 'Äthiopien', es: 'Etiopía' },
  'FK': { it: 'Isole Falkland', en: 'Falkland Islands', fr: 'Îles Malouines', de: 'Falklandinseln', es: 'Islas Malvinas' },
  'FO': { it: 'Isole Faroe', en: 'Faroe Islands', fr: 'Îles Féroé', de: 'Färöer', es: 'Islas Feroe' },
  'FJ': { it: 'Figi', en: 'Fiji', fr: 'Fidji', de: 'Fidschi', es: 'Fiyi' },
  'FI': { it: 'Finlandia', en: 'Finland', fr: 'Finlande', de: 'Finnland', es: 'Finlandia' },
  'FR': { it: 'Francia', en: 'France', fr: 'France', de: 'Frankreich', es: 'Francia' },
  'GF': { it: 'Guiana Francese', en: 'French Guiana', fr: 'Guyane française', de: 'Französisch-Guayana', es: 'Guayana Francesa' },
  'PF': { it: 'Polinesia Francese', en: 'French Polynesia', fr: 'Polynésie française', de: 'Französisch-Polynesien', es: 'Polinesia Francesa' },
  'TF': { it: 'Terre Australi Francesi', en: 'French Southern Territories', fr: 'Terres australes françaises', de: 'Französische Süd- und Antarktisgebiete', es: 'Tierras Australes Francesas' },
  'GA': { it: 'Gabon', en: 'Gabon', fr: 'Gabon', de: 'Gabun', es: 'Gabón' },
  'GM': { it: 'Gambia', en: 'Gambia', fr: 'Gambie', de: 'Gambia', es: 'Gambia' },
  'GE': { it: 'Georgia', en: 'Georgia', fr: 'Géorgie', de: 'Georgien', es: 'Georgia' },
  'DE': { it: 'Germania', en: 'Germany', fr: 'Allemagne', de: 'Deutschland', es: 'Alemania' },
  'GH': { it: 'Ghana', en: 'Ghana', fr: 'Ghana', de: 'Ghana', es: 'Ghana' },
  'GI': { it: 'Gibilterra', en: 'Gibraltar', fr: 'Gibraltar', de: 'Gibraltar', es: 'Gibraltar' },
  'GR': { it: 'Grecia', en: 'Greece', fr: 'Grèce', de: 'Griechenland', es: 'Grecia' },
  'GL': { it: 'Groenlandia', en: 'Greenland', fr: 'Groenland', de: 'Grönland', es: 'Groenlandia' },
  'GD': { it: 'Grenada', en: 'Grenada', fr: 'Grenade', de: 'Grenada', es: 'Granada' },
  'GP': { it: 'Guadalupa', en: 'Guadeloupe', fr: 'Guadeloupe', de: 'Guadeloupe', es: 'Guadalupe' },
  'GU': { it: 'Guam', en: 'Guam', fr: 'Guam', de: 'Guam', es: 'Guam' },
  'GT': { it: 'Guatemala', en: 'Guatemala', fr: 'Guatemala', de: 'Guatemala', es: 'Guatemala' },
  'GG': { it: 'Guernsey', en: 'Guernsey', fr: 'Guernesey', de: 'Guernsey', es: 'Guernsey' },
  'GN': { it: 'Guinea', en: 'Guinea', fr: 'Guinée', de: 'Guinea', es: 'Guinea' },
  'GW': { it: 'Guinea-Bissau', en: 'Guinea-Bissau', fr: 'Guinée-Bissau', de: 'Guinea-Bissau', es: 'Guinea-Bisáu' },
  'GY': { it: 'Guyana', en: 'Guyana', fr: 'Guyane', de: 'Guyana', es: 'Guyana' },
  'HT': { it: 'Haiti', en: 'Haiti', fr: 'Haïti', de: 'Haiti', es: 'Haití' },
  'HM': { it: 'Isole Heard e McDonald', en: 'Heard Island and McDonald Islands', fr: 'Île Heard-et-Îles McDonald', de: 'Heard und McDonaldinseln', es: 'Islas Heard y McDonald' },
  'VA': { it: 'Città del Vaticano', en: 'Vatican City', fr: 'Vatican', de: 'Vatikanstadt', es: 'Ciudad del Vaticano' },
  'HN': { it: 'Honduras', en: 'Honduras', fr: 'Honduras', de: 'Honduras', es: 'Honduras' },
  'HK': { it: 'Hong Kong', en: 'Hong Kong', fr: 'Hong Kong', de: 'Hongkong', es: 'Hong Kong' },
  'HU': { it: 'Ungheria', en: 'Hungary', fr: 'Hongrie', de: 'Ungarn', es: 'Hungría' },
  'IS': { it: 'Islanda', en: 'Iceland', fr: 'Islande', de: 'Island', es: 'Islandia' },
  'IN': { it: 'India', en: 'India', fr: 'Inde', de: 'Indien', es: 'India' },
  'ID': { it: 'Indonesia', en: 'Indonesia', fr: 'Indonésie', de: 'Indonesien', es: 'Indonesia' },
  'IR': { it: 'Iran', en: 'Iran', fr: 'Iran', de: 'Iran', es: 'Irán' },
  'IQ': { it: 'Iraq', en: 'Iraq', fr: 'Irak', de: 'Irak', es: 'Irak' },
  'IE': { it: 'Irlanda', en: 'Ireland', fr: 'Irlande', de: 'Irland', es: 'Irlanda' },
  'IM': { it: 'Isola di Man', en: 'Isle of Man', fr: 'Île de Man', de: 'Isle of Man', es: 'Isla de Man' },
  'IL': { it: 'Israele', en: 'Israel', fr: 'Israël', de: 'Israel', es: 'Israel' },
  'IT': { it: 'Italia', en: 'Italy', fr: 'Italie', de: 'Italien', es: 'Italia' },
  'JM': { it: 'Giamaica', en: 'Jamaica', fr: 'Jamaïque', de: 'Jamaika', es: 'Jamaica' },
  'JP': { it: 'Giappone', en: 'Japan', fr: 'Japon', de: 'Japan', es: 'Japón' },
  'JE': { it: 'Jersey', en: 'Jersey', fr: 'Jersey', de: 'Jersey', es: 'Jersey' },
  'JO': { it: 'Giordania', en: 'Jordan', fr: 'Jordanie', de: 'Jordanien', es: 'Jordania' },
  'KZ': { it: 'Kazakistan', en: 'Kazakhstan', fr: 'Kazakhstan', de: 'Kasachstan', es: 'Kazajistán' },
  'KE': { it: 'Kenya', en: 'Kenya', fr: 'Kenya', de: 'Kenia', es: 'Kenia' },
  'KI': { it: 'Kiribati', en: 'Kiribati', fr: 'Kiribati', de: 'Kiribati', es: 'Kiribati' },
  'KP': { it: 'Corea del Nord', en: 'North Korea', fr: 'Corée du Nord', de: 'Nordkorea', es: 'Corea del Norte' },
  'KR': { it: 'Corea del Sud', en: 'South Korea', fr: 'Corée du Sud', de: 'Südkorea', es: 'Corea del Sur' },
  'KW': { it: 'Kuwait', en: 'Kuwait', fr: 'Koweït', de: 'Kuwait', es: 'Kuwait' },
  'KG': { it: 'Kirghizistan', en: 'Kyrgyzstan', fr: 'Kirghizistan', de: 'Kirgisistan', es: 'Kirguistán' },
  'LA': { it: 'Laos', en: 'Laos', fr: 'Laos', de: 'Laos', es: 'Laos' },
  'LV': { it: 'Lettonia', en: 'Latvia', fr: 'Lettonie', de: 'Lettland', es: 'Letonia' },
  'LB': { it: 'Libano', en: 'Lebanon', fr: 'Liban', de: 'Libanon', es: 'Líbano' },
  'LS': { it: 'Lesotho', en: 'Lesotho', fr: 'Lesotho', de: 'Lesotho', es: 'Lesoto' },
  'LR': { it: 'Liberia', en: 'Liberia', fr: 'Libéria', de: 'Liberia', es: 'Liberia' },
  'LY': { it: 'Libia', en: 'Libya', fr: 'Libye', de: 'Libyen', es: 'Libia' },
  'LI': { it: 'Liechtenstein', en: 'Liechtenstein', fr: 'Liechtenstein', de: 'Liechtenstein', es: 'Liechtenstein' },
  'LT': { it: 'Lituania', en: 'Lithuania', fr: 'Lituanie', de: 'Litauen', es: 'Lituania' },
  'LU': { it: 'Lussemburgo', en: 'Luxembourg', fr: 'Luxembourg', de: 'Luxemburg', es: 'Luxemburgo' },
  'MO': { it: 'Macao', en: 'Macao', fr: 'Macao', de: 'Macao', es: 'Macao' },
  'MG': { it: 'Madagascar', en: 'Madagascar', fr: 'Madagascar', de: 'Madagaskar', es: 'Madagascar' },
  'MW': { it: 'Malawi', en: 'Malawi', fr: 'Malawi', de: 'Malawi', es: 'Malaui' },
  'MY': { it: 'Malaysia', en: 'Malaysia', fr: 'Malaisie', de: 'Malaysia', es: 'Malasia' },
  'MV': { it: 'Maldive', en: 'Maldives', fr: 'Maldives', de: 'Malediven', es: 'Maldivas' },
  'ML': { it: 'Mali', en: 'Mali', fr: 'Mali', de: 'Mali', es: 'Malí' },
  'MT': { it: 'Malta', en: 'Malta', fr: 'Malte', de: 'Malta', es: 'Malta' },
  'MH': { it: 'Isole Marshall', en: 'Marshall Islands', fr: 'Îles Marshall', de: 'Marshallinseln', es: 'Islas Marshall' },
  'MQ': { it: 'Martinica', en: 'Martinique', fr: 'Martinique', de: 'Martinique', es: 'Martinica' },
  'MR': { it: 'Mauritania', en: 'Mauritania', fr: 'Mauritanie', de: 'Mauretanien', es: 'Mauritania' },
  'MU': { it: 'Mauritius', en: 'Mauritius', fr: 'Maurice', de: 'Mauritius', es: 'Mauricio' },
  'YT': { it: 'Mayotte', en: 'Mayotte', fr: 'Mayotte', de: 'Mayotte', es: 'Mayotte' },
  'MX': { it: 'Messico', en: 'Mexico', fr: 'Mexique', de: 'Mexiko', es: 'México' },
  'FM': { it: 'Micronesia', en: 'Micronesia', fr: 'Micronésie', de: 'Mikronesien', es: 'Micronesia' },
  'MD': { it: 'Moldavia', en: 'Moldova', fr: 'Moldavie', de: 'Moldau', es: 'Moldavia' },
  'MC': { it: 'Monaco', en: 'Monaco', fr: 'Monaco', de: 'Monaco', es: 'Mónaco' },
  'MN': { it: 'Mongolia', en: 'Mongolia', fr: 'Mongolie', de: 'Mongolei', es: 'Mongolia' },
  'ME': { it: 'Montenegro', en: 'Montenegro', fr: 'Monténégro', de: 'Montenegro', es: 'Montenegro' },
  'MS': { it: 'Montserrat', en: 'Montserrat', fr: 'Montserrat', de: 'Montserrat', es: 'Montserrat' },
  'MA': { it: 'Marocco', en: 'Morocco', fr: 'Maroc', de: 'Marokko', es: 'Marruecos' },
  'MZ': { it: 'Mozambico', en: 'Mozambique', fr: 'Mozambique', de: 'Mosambik', es: 'Mozambique' },
  'MM': { it: 'Myanmar', en: 'Myanmar', fr: 'Myanmar', de: 'Myanmar', es: 'Myanmar' },
  'NA': { it: 'Namibia', en: 'Namibia', fr: 'Namibie', de: 'Namibia', es: 'Namibia' },
  'NR': { it: 'Nauru', en: 'Nauru', fr: 'Nauru', de: 'Nauru', es: 'Nauru' },
  'NP': { it: 'Nepal', en: 'Nepal', fr: 'Népal', de: 'Nepal', es: 'Nepal' },
  'NL': { it: 'Paesi Bassi', en: 'Netherlands', fr: 'Pays-Bas', de: 'Niederlande', es: 'Países Bajos' },
  'NC': { it: 'Nuova Caledonia', en: 'New Caledonia', fr: 'Nouvelle-Calédonie', de: 'Neukaledonien', es: 'Nueva Caledonia' },
  'NZ': { it: 'Nuova Zelanda', en: 'New Zealand', fr: 'Nouvelle-Zélande', de: 'Neuseeland', es: 'Nueva Zelanda' },
  'NI': { it: 'Nicaragua', en: 'Nicaragua', fr: 'Nicaragua', de: 'Nicaragua', es: 'Nicaragua' },
  'NE': { it: 'Niger', en: 'Niger', fr: 'Niger', de: 'Niger', es: 'Níger' },
  'NG': { it: 'Nigeria', en: 'Nigeria', fr: 'Nigeria', de: 'Nigeria', es: 'Nigeria' },
  'NU': { it: 'Niue', en: 'Niue', fr: 'Niue', de: 'Niue', es: 'Niue' },
  'NF': { it: 'Isola Norfolk', en: 'Norfolk Island', fr: 'Île Norfolk', de: 'Norfolkinsel', es: 'Isla Norfolk' },
  'MK': { it: 'Macedonia del Nord', en: 'North Macedonia', fr: 'Macédoine du Nord', de: 'Nordmazedonien', es: 'Macedonia del Norte' },
  'MP': { it: 'Isole Marianne Settentrionali', en: 'Northern Mariana Islands', fr: 'Îles Mariannes du Nord', de: 'Nördliche Marianen', es: 'Islas Marianas del Norte' },
  'NO': { it: 'Norvegia', en: 'Norway', fr: 'Norvège', de: 'Norwegen', es: 'Noruega' },
  'OM': { it: 'Oman', en: 'Oman', fr: 'Oman', de: 'Oman', es: 'Omán' },
  'PK': { it: 'Pakistan', en: 'Pakistan', fr: 'Pakistan', de: 'Pakistan', es: 'Pakistán' },
  'PW': { it: 'Palau', en: 'Palau', fr: 'Palaos', de: 'Palau', es: 'Palaos' },
  'PS': { it: 'Palestina', en: 'Palestine', fr: 'Palestine', de: 'Palästina', es: 'Palestina' },
  'PA': { it: 'Panama', en: 'Panama', fr: 'Panama', de: 'Panama', es: 'Panamá' },
  'PG': { it: 'Papua Nuova Guinea', en: 'Papua New Guinea', fr: 'Papouasie-Nouvelle-Guinée', de: 'Papua-Neuguinea', es: 'Papúa Nueva Guinea' },
  'PY': { it: 'Paraguay', en: 'Paraguay', fr: 'Paraguay', de: 'Paraguay', es: 'Paraguay' },
  'PE': { it: 'Perù', en: 'Peru', fr: 'Pérou', de: 'Peru', es: 'Perú' },
  'PH': { it: 'Filippine', en: 'Philippines', fr: 'Philippines', de: 'Philippinen', es: 'Filipinas' },
  'PN': { it: 'Isole Pitcairn', en: 'Pitcairn Islands', fr: 'Îles Pitcairn', de: 'Pitcairninseln', es: 'Islas Pitcairn' },
  'PL': { it: 'Polonia', en: 'Poland', fr: 'Pologne', de: 'Polen', es: 'Polonia' },
  'PT': { it: 'Portogallo', en: 'Portugal', fr: 'Portugal', de: 'Portugal', es: 'Portugal' },
  'PR': { it: 'Porto Rico', en: 'Puerto Rico', fr: 'Porto Rico', de: 'Puerto Rico', es: 'Puerto Rico' },
  'QA': { it: 'Qatar', en: 'Qatar', fr: 'Qatar', de: 'Katar', es: 'Catar' },
  'RE': { it: 'Riunione', en: 'Réunion', fr: 'La Réunion', de: 'Réunion', es: 'Reunión' },
  'RO': { it: 'Romania', en: 'Romania', fr: 'Roumanie', de: 'Rumänien', es: 'Rumanía' },
  'RU': { it: 'Russia', en: 'Russia', fr: 'Russie', de: 'Russland', es: 'Rusia' },
  'RW': { it: 'Ruanda', en: 'Rwanda', fr: 'Rwanda', de: 'Ruanda', es: 'Ruanda' },
  'BL': { it: 'Saint-Barthélemy', en: 'Saint Barthélemy', fr: 'Saint-Barthélemy', de: 'Saint-Barthélemy', es: 'San Bartolomé' },
  'SH': { it: 'Sant\'Elena', en: 'Saint Helena', fr: 'Sainte-Hélène', de: 'St. Helena', es: 'Santa Elena' },
  'KN': { it: 'Saint Kitts e Nevis', en: 'Saint Kitts and Nevis', fr: 'Saint-Kitts-et-Nevis', de: 'St. Kitts und Nevis', es: 'San Cristóbal y Nieves' },
  'LC': { it: 'Santa Lucia', en: 'Saint Lucia', fr: 'Sainte-Lucie', de: 'St. Lucia', es: 'Santa Lucía' },
  'MF': { it: 'Saint Martin', en: 'Saint Martin', fr: 'Saint-Martin', de: 'Saint-Martin', es: 'San Martín' },
  'PM': { it: 'Saint-Pierre e Miquelon', en: 'Saint Pierre and Miquelon', fr: 'Saint-Pierre-et-Miquelon', de: 'St. Pierre und Miquelon', es: 'San Pedro y Miquelón' },
  'VC': { it: 'Saint Vincent e Grenadine', en: 'Saint Vincent and the Grenadines', fr: 'Saint-Vincent-et-les-Grenadines', de: 'St. Vincent und die Grenadinen', es: 'San Vicente y las Granadinas' },
  'WS': { it: 'Samoa', en: 'Samoa', fr: 'Samoa', de: 'Samoa', es: 'Samoa' },
  'SM': { it: 'San Marino', en: 'San Marino', fr: 'Saint-Marin', de: 'San Marino', es: 'San Marino' },
  'ST': { it: 'São Tomé e Príncipe', en: 'São Tomé and Príncipe', fr: 'Sao Tomé-et-Principe', de: 'São Tomé und Príncipe', es: 'Santo Tomé y Príncipe' },
  'SA': { it: 'Arabia Saudita', en: 'Saudi Arabia', fr: 'Arabie saoudite', de: 'Saudi-Arabien', es: 'Arabia Saudita' },
  'SN': { it: 'Senegal', en: 'Senegal', fr: 'Sénégal', de: 'Senegal', es: 'Senegal' },
  'RS': { it: 'Serbia', en: 'Serbia', fr: 'Serbie', de: 'Serbien', es: 'Serbia' },
  'SC': { it: 'Seychelles', en: 'Seychelles', fr: 'Seychelles', de: 'Seychellen', es: 'Seychelles' },
  'SL': { it: 'Sierra Leone', en: 'Sierra Leone', fr: 'Sierra Leone', de: 'Sierra Leone', es: 'Sierra Leona' },
  'SG': { it: 'Singapore', en: 'Singapore', fr: 'Singapour', de: 'Singapur', es: 'Singapur' },
  'SX': { it: 'Sint Maarten', en: 'Sint Maarten', fr: 'Saint-Martin', de: 'Sint Maarten', es: 'Sint Maarten' },
  'SK': { it: 'Slovacchia', en: 'Slovakia', fr: 'Slovaquie', de: 'Slowakei', es: 'Eslovaquia' },
  'SI': { it: 'Slovenia', en: 'Slovenia', fr: 'Slovénie', de: 'Slowenien', es: 'Eslovenia' },
  'SB': { it: 'Isole Salomone', en: 'Solomon Islands', fr: 'Îles Salomon', de: 'Salomonen', es: 'Islas Salomón' },
  'SO': { it: 'Somalia', en: 'Somalia', fr: 'Somalie', de: 'Somalia', es: 'Somalia' },
  'ZA': { it: 'Sudafrica', en: 'South Africa', fr: 'Afrique du Sud', de: 'Südafrika', es: 'Sudáfrica' },
  'GS': { it: 'Georgia del Sud e Isole Sandwich Australi', en: 'South Georgia and the South Sandwich Islands', fr: 'Géorgie du Sud-et-les Îles Sandwich du Sud', de: 'Südgeorgien und die Südlichen Sandwichinseln', es: 'Islas Georgia del Sur y Sandwich del Sur' },
  'SS': { it: 'Sudan del Sud', en: 'South Sudan', fr: 'Soudan du Sud', de: 'Südsudan', es: 'Sudán del Sur' },
  'ES': { it: 'Spagna', en: 'Spain', fr: 'Espagne', de: 'Spanien', es: 'España' },
  'LK': { it: 'Sri Lanka', en: 'Sri Lanka', fr: 'Sri Lanka', de: 'Sri Lanka', es: 'Sri Lanka' },
  'SD': { it: 'Sudan', en: 'Sudan', fr: 'Soudan', de: 'Sudan', es: 'Sudán' },
  'SR': { it: 'Suriname', en: 'Suriname', fr: 'Suriname', de: 'Surinam', es: 'Surinam' },
  'SJ': { it: 'Svalbard e Jan Mayen', en: 'Svalbard and Jan Mayen', fr: 'Svalbard et Jan Mayen', de: 'Spitzbergen und Jan Mayen', es: 'Svalbard y Jan Mayen' },
  'SE': { it: 'Svezia', en: 'Sweden', fr: 'Suède', de: 'Schweden', es: 'Suecia' },
  'CH': { it: 'Svizzera', en: 'Switzerland', fr: 'Suisse', de: 'Schweiz', es: 'Suiza' },
  'SY': { it: 'Siria', en: 'Syria', fr: 'Syrie', de: 'Syrien', es: 'Siria' },
  'TW': { it: 'Taiwan', en: 'Taiwan', fr: 'Taïwan', de: 'Taiwan', es: 'Taiwán' },
  'TJ': { it: 'Tagikistan', en: 'Tajikistan', fr: 'Tadjikistan', de: 'Tadschikistan', es: 'Tayikistán' },
  'TZ': { it: 'Tanzania', en: 'Tanzania', fr: 'Tanzanie', de: 'Tansania', es: 'Tanzania' },
  'TH': { it: 'Thailandia', en: 'Thailand', fr: 'Thaïlande', de: 'Thailand', es: 'Tailandia' },
  'TL': { it: 'Timor Est', en: 'Timor-Leste', fr: 'Timor oriental', de: 'Osttimor', es: 'Timor Oriental' },
  'TG': { it: 'Togo', en: 'Togo', fr: 'Togo', de: 'Togo', es: 'Togo' },
  'TK': { it: 'Tokelau', en: 'Tokelau', fr: 'Tokelau', de: 'Tokelau', es: 'Tokelau' },
  'TO': { it: 'Tonga', en: 'Tonga', fr: 'Tonga', de: 'Tonga', es: 'Tonga' },
  'TT': { it: 'Trinidad e Tobago', en: 'Trinidad and Tobago', fr: 'Trinité-et-Tobago', de: 'Trinidad und Tobago', es: 'Trinidad y Tobago' },
  'TN': { it: 'Tunisia', en: 'Tunisia', fr: 'Tunisie', de: 'Tunesien', es: 'Túnez' },
  'TR': { it: 'Turchia', en: 'Turkey', fr: 'Turquie', de: 'Türkei', es: 'Turquía' },
  'TM': { it: 'Turkmenistan', en: 'Turkmenistan', fr: 'Turkménistan', de: 'Turkmenistan', es: 'Turkmenistán' },
  'TC': { it: 'Isole Turks e Caicos', en: 'Turks and Caicos Islands', fr: 'Îles Turques-et-Caïques', de: 'Turks- und Caicosinseln', es: 'Islas Turcas y Caicos' },
  'TV': { it: 'Tuvalu', en: 'Tuvalu', fr: 'Tuvalu', de: 'Tuvalu', es: 'Tuvalu' },
  'UG': { it: 'Uganda', en: 'Uganda', fr: 'Ouganda', de: 'Uganda', es: 'Uganda' },
  'UA': { it: 'Ucraina', en: 'Ukraine', fr: 'Ukraine', de: 'Ukraine', es: 'Ucrania' },
  'AE': { it: 'Emirati Arabi Uniti', en: 'United Arab Emirates', fr: 'Émirats arabes unis', de: 'Vereinigte Arabische Emirate', es: 'Emiratos Árabes Unidos' },
  'GB': { it: 'Regno Unito', en: 'United Kingdom', fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', es: 'Reino Unido' },
  'US': { it: 'Stati Uniti', en: 'United States', fr: 'États-Unis', de: 'Vereinigte Staaten', es: 'Estados Unidos' },
  'UM': { it: 'Isole minori esterne degli Stati Uniti', en: 'United States Minor Outlying Islands', fr: 'Îles mineures éloignées des États-Unis', de: 'Kleinere abgelegene Inseln der Vereinigten Staaten', es: 'Islas Ultramarinas Menores de los Estados Unidos' },
  'UY': { it: 'Uruguay', en: 'Uruguay', fr: 'Uruguay', de: 'Uruguay', es: 'Uruguay' },
  'UZ': { it: 'Uzbekistan', en: 'Uzbekistan', fr: 'Ouzbékistan', de: 'Usbekistan', es: 'Uzbekistán' },
  'VU': { it: 'Vanuatu', en: 'Vanuatu', fr: 'Vanuatu', de: 'Vanuatu', es: 'Vanuatu' },
  'VE': { it: 'Venezuela', en: 'Venezuela', fr: 'Venezuela', de: 'Venezuela', es: 'Venezuela' },
  'VN': { it: 'Vietnam', en: 'Vietnam', fr: 'Viêt Nam', de: 'Vietnam', es: 'Vietnam' },
  'VG': { it: 'Isole Vergini Britanniche', en: 'British Virgin Islands', fr: 'Îles Vierges britanniques', de: 'Britische Jungferninseln', es: 'Islas Vírgenes Británicas' },
  'VI': { it: 'Isole Vergini Americane', en: 'U.S. Virgin Islands', fr: 'Îles Vierges américaines', de: 'Amerikanische Jungferninseln', es: 'Islas Vírgenes de los Estados Unidos' },
  'WF': { it: 'Wallis e Futuna', en: 'Wallis and Futuna', fr: 'Wallis-et-Futuna', de: 'Wallis und Futuna', es: 'Wallis y Futuna' },
  'EH': { it: 'Sahara Occidentale', en: 'Western Sahara', fr: 'Sahara occidental', de: 'Westsahara', es: 'Sahara Occidental' },
  'YE': { it: 'Yemen', en: 'Yemen', fr: 'Yémen', de: 'Jemen', es: 'Yemen' },
  'ZM': { it: 'Zambia', en: 'Zambia', fr: 'Zambie', de: 'Sambia', es: 'Zambia' },
  'ZW': { it: 'Zimbabwe', en: 'Zimbabwe', fr: 'Zimbabwe', de: 'Simbabwe', es: 'Zimbabue' }
};

/**
 * Traduce il codice ISO 3166-1 alpha-2 di un paese nel nome localizzato.
 * @param {string} countryCode  - Codice ISO a 2 lettere (es: "IT", "US")
 * @param {string} targetLang   - Codice lingua ('it','en','fr','de','es')
 * @returns {string} - Nome del paese tradotto, oppure il codice originale se non trovato
 */
function translateCountryName(countryCode, targetLang) {
  if (!countryCode) return '';
  const code = countryCode.toUpperCase();
  const entry = translationsCountries[code];
  if (!entry) return code;
  return entry[targetLang] || entry['en'] || code;
}

// Esporta per uso globale
if (typeof window !== 'undefined') {
  window.translationsCountries  = translationsCountries;
  window.translateCountryName   = translateCountryName;
}

/* ============================================================
   TRADUZIONI DELIVERY ESTIMATOR — LuxHaven360 × Printful
   Lingue: IT · EN · FR · DE · ES

   Chiavi:
     label        → intestazione sezione (es. "Consegna Stimata")
     days_range   → template intervallo giorni (usa {min} e {max})
     tbd          → testo quando la stima non è ancora disponibile
     legal_note   → nota legale/disclaimer (disclaimer trasparente)
   ============================================================ */
const translationsDelivery = {

  it: {
    label:      'Consegna Stimata',
    days_range: '{min}–{max} giorni lavorativi',
    tbd:        'stima in fase di definizione',
    legal_note: 'La stima indicata è calcolata sulla base dei dati storici di produzione e spedizione. I tempi effettivi possono variare in ragione di procedure doganali, operatività dei corrieri o eventi straordinari. Ha carattere puramente indicativo e non costituisce impegno contrattuale.'
  },

  en: {
    label:      'Estimated Delivery',
    days_range: '{min}–{max} business days',
    tbd:        'estimate being defined',
    legal_note: 'The indicated estimate is calculated on the basis of historical production and shipping data. Actual times may vary due to customs procedures, carrier operations or extraordinary events. It is purely indicative and does not constitute a contractual commitment.'
  },

  fr: {
    label:      'Livraison Estimée',
    days_range: '{min}–{max} jours ouvrés',
    tbd:        'estimation en cours de définition',
    legal_note: "L'estimation indiquée est calculée sur la base des données historiques de production et d'expédition. Les délais réels peuvent varier en raison des procédures douanières, des opérations des transporteurs ou d'événements extraordinaires. Elle a un caractère purement indicatif et ne constitue pas un engagement contractuel."
  },

  de: {
    label:      'Geschätzte Lieferzeit',
    days_range: '{min}–{max} Werktage',
    tbd:        'Schätzung wird noch festgelegt',
    legal_note: 'Die angegebene Schätzung wird auf der Grundlage historischer Produktions- und Versanddaten berechnet. Die tatsächlichen Zeiten können aufgrund von Zollverfahren, Kurierbetrieb oder außergewöhnlichen Ereignissen variieren. Sie ist rein indikativ und stellt keine vertragliche Verpflichtung dar.'
  },

  es: {
    label:      'Entrega Estimada',
    days_range: '{min}–{max} días hábiles',
    tbd:        'estimación en proceso de definición',
    legal_note: 'La estimación indicada se calcula sobre la base de datos históricos de producción y envío. Los tiempos reales pueden variar debido a procedimientos aduaneros, operaciones de los transportistas o eventos extraordinarios. Tiene carácter meramente indicativo y no constituye un compromiso contractual.'
  }

};

if (typeof window !== 'undefined') {
  window.translationsDelivery = translationsDelivery;
}


/* ============================================================
 *  TRADUZIONI MESI — usate da tracking-order.html
 *  per localizzare le date di consegna prevista
 *  (es. "3–18 marzo" → "3–18 March" in inglese)
 * ============================================================ */
const translationsMonths = {
  it: ['gennaio','febbraio','marzo','aprile','maggio','giugno',
       'luglio','agosto','settembre','ottobre','novembre','dicembre'],
  en: ['january','february','march','april','may','june',
       'july','august','september','october','november','december'],
  fr: ['janvier','février','mars','avril','mai','juin',
       'juillet','août','septembre','octobre','novembre','décembre'],
  de: ['januar','februar','märz','april','mai','juni',
       'juli','august','september','oktober','november','dezember'],
  es: ['enero','febrero','marzo','abril','mayo','junio',
       'julio','agosto','septiembre','octubre','noviembre','diciembre']
};
if (typeof window !== 'undefined') window.translationsMonths = translationsMonths;

/* ============================================================
 *  LABEL "CONSEGNA NON ANCORA DEFINITA" per pagina tracking
 *  Corrisponde al valore "Da definire" salvato nel foglio OT
 * ============================================================ */
const translationsDeliveryUndefined = {
  it: 'Da definire',
  en: 'To be confirmed',
  fr: 'À définir',
  de: 'Noch offen',
  es: 'Por definir'
};
if (typeof window !== 'undefined') window.translationsDeliveryUndefined = translationsDeliveryUndefined;

/* ============================================================
 *  LABEL "CONSEGNA PREVISTA" per la card tracking
 * ============================================================ */
const translationsDeliveryTrackingLabel = {
  it: 'Consegna prevista',
  en: 'Expected delivery',
  fr: 'Livraison prévue',
  de: 'Voraussichtliche Lieferung',
  es: 'Entrega prevista'
};
if (typeof window !== 'undefined') window.translationsDeliveryTrackingLabel = translationsDeliveryTrackingLabel;


/* ============================================================
 *  TRADUZIONI STATI ORDINE — badge in tracking-order.html
 *  Chiave = valore italiano salvato nel DB (Order Tracking sheet)
 *  La pagina usa sempre questi per tradurre il badge stato.
 * ============================================================ */
const translationsOrderStatus = {
  'Confermato':      { it: 'Confermato',      en: 'Confirmed',       fr: 'Confirmé',       de: 'Bestätigt',       es: 'Confirmado'      },
  'In Preparazione': { it: 'In Preparazione', en: 'Preparing',       fr: 'En préparation', de: 'In Vorbereitung', es: 'En preparación'  },
  'In Transito':     { it: 'In Transito',     en: 'In Transit',      fr: 'En transit',     de: 'Unterwegs',       es: 'En tránsito'     },
  'Consegnato':      { it: 'Consegnato',      en: 'Delivered',       fr: 'Livré',          de: 'Zugestellt',      es: 'Entregado'       }
};
if (typeof window !== 'undefined') window.translationsOrderStatus = translationsOrderStatus;
