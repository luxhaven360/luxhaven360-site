/**
 * 🌍 Traduzioni Personalizzate per Contenuti Prodotti Prenotabili
 * Versione: 1.0.0
 * 
 * Sistema di traduzioni statiche per:
 * - Benefit
 * - Descrizione
 * - Prestazioni
 * - Caratteristiche
 * - Politiche
 */

const productTranslations = {
  
  // =============================================
  // BENEFIT (4 VARIANTI)
  // =============================================
  
  benefit: {
    // VARIANTE 1: Combo con posti posteriori disponibili
    "2 supercar, posti posteriori disponibili, ok bambini da 5 anni, assicurazione completa, nessuna cauzione, cambio data garantito, rimborso flessibile, patente internazionale valida": {
      en: "2 supercars, rear seats available, children 5+ welcome, full insurance, no deposit, guaranteed date change, flexible refund, international license valid",
      fr: "2 supercars, sièges arrière disponibles, enfants dès 5 ans bienvenus, assurance complète, aucune caution, changement de date garanti, remboursement flexible, permis international valide",
      de: "2 Supercars, Rücksitze verfügbar, Kinder ab 5 Jahren willkommen, Vollversicherung, keine Kaution, garantierte Terminänderung, flexible Rückerstattung, internationaler Führerschein gültig",
      es: "2 superdeportivos, asientos traseros disponibles, niños desde 5 años bienvenidos, seguro completo, sin depósito, cambio de fecha garantizado, reembolso flexible, licencia internacional válida"
    },
    
    // VARIANTE 2: Combo senza posti posteriori
    "2 supercar, ok bambini da 5 anni, assicurazione completa, nessuna cauzione, cambio data garantito, rimborso flessibile, patente internazionale valida": {
      en: "2 supercars, children 5+ welcome, full insurance, no deposit, guaranteed date change, flexible refund, international license valid",
      fr: "2 supercars, enfants dès 5 ans bienvenus, assurance complète, aucune caution, changement de date garanti, remboursement flexible, permis international valide",
      de: "2 Supercars, Kinder ab 5 Jahren willkommen, Vollversicherung, keine Kaution, garantierte Terminänderung, flexible Rückerstattung, internationaler Führerschein gültig",
      es: "2 superdeportivos, niños desde 5 años bienvenidos, seguro completo, sin depósito, cambio de fecha garantizado, reembolso flexible, licencia internacional válida"
    },
    
    // VARIANTE 3: Singola vettura con posti posteriori
    "posti posteriori disponibili, ok bambini da 5 anni, assicurazione completa, nessuna cauzione, cambio data garantito, rimborso flessibile, patente internazionale valida": {
      en: "rear seats available, children 5+ welcome, full insurance, no deposit, guaranteed date change, flexible refund, international license valid",
      fr: "sièges arrière disponibles, enfants dès 5 ans bienvenus, assurance complète, aucune caution, changement de date garanti, remboursement flexible, permis international valide",
      de: "Rücksitze verfügbar, Kinder ab 5 Jahren willkommen, Vollversicherung, keine Kaution, garantierte Terminänderung, flexible Rückerstattung, internationaler Führerschein gültig",
      es: "asientos traseros disponibles, niños desde 5 años bienvenidos, seguro completo, sin depósito, cambio de fecha garantizado, reembolso flexible, licencia internacional válida"
    },
    
    // VARIANTE 4: Singola vettura senza posti posteriori
    "ok bambini da 5 anni, assicurazione completa, nessuna cauzione, cambio data garantito, rimborso flessibile, patente internazionale valida": {
      en: "children 5+ welcome, full insurance, no deposit, guaranteed date change, flexible refund, international license valid",
      fr: "enfants dès 5 ans bienvenus, assurance complète, aucune caution, changement de date garanti, remboursement flexible, permis international valide",
      de: "Kinder ab 5 Jahren willkommen, Vollversicherung, keine Kaution, garantierte Terminänderung, flexible Rückerstattung, internationaler Führerschein gültig",
      es: "niños desde 5 años bienvenidos, seguro completo, sin depósito, cambio de fecha garantizado, reembolso flexible, licencia internacional válida"
    }
  },
  
  // =============================================
  // DESCRIZIONE (TUTTI I PRODOTTI)
  // =============================================
  
  descrizione: {
    // California + 458 Italia
    "Vivi l'emozione unica di guidare due icone della velocità e del design italiano: la Ferrari California e la Ferrari 458 Italia. La California, elegante Gran Turismo a 4 posti, unisce comfort e potenza con il suo motore V8 anteriore centrale, permettendoti di condividere l'esperienza con due passeggeri. La 458 Italia, invece, incarna la pura essenza sportiva: il suo V8 da 570 cavalli e 9.000 giri al minuto trasforma ogni accelerazione in un brivido indimenticabile. Due vetture, due anime, un'unica esperienza esclusiva su strada che unisce lusso, adrenalina e perfezione ingegneristica.": {
      en: "Experience the unique thrill of driving two icons of Italian speed and design: the Ferrari California and the Ferrari 458 Italia. The California, an elegant 4-seater Gran Turismo, combines comfort and power with its front-mid V8 engine, allowing you to share the experience with two passengers. The 458 Italia, on the other hand, embodies pure sporting essence: its 570-horsepower V8 at 9,000 rpm transforms every acceleration into an unforgettable thrill. Two cars, two souls, one exclusive road experience combining luxury, adrenaline and engineering perfection.",
      fr: "Vivez l'émotion unique de conduire deux icônes de la vitesse et du design italien : la Ferrari California et la Ferrari 458 Italia. La California, élégante Gran Turismo 4 places, allie confort et puissance grâce à son V8 avant-central, vous permettant de partager l'expérience avec deux passagers. La 458 Italia, quant à elle, incarne la pure essence sportive : son V8 de 570 chevaux à 9 000 tr/min transforme chaque accélération en un frisson inoubliable. Deux voitures, deux âmes, une seule expérience exclusive sur route alliant luxe, adrénaline et perfection d'ingénierie.",
      de: "Erleben Sie den einzigartigen Nervenkitzel, zwei Ikonen italienischer Geschwindigkeit und Designs zu fahren: den Ferrari California und den Ferrari 458 Italia. Der California, ein eleganter 4-sitziger Gran Turismo, vereint Komfort und Kraft mit seinem mittigen V8-Frontmotor und ermöglicht es Ihnen, das Erlebnis mit zwei Passagieren zu teilen. Der 458 Italia verkörpert hingegen pure Sportlichkeit: Sein 570-PS-V8 bei 9.000 U/min verwandelt jede Beschleunigung in einen unvergesslichen Nervenkitzel. Zwei Autos, zwei Seelen, ein exklusives Straßenerlebnis, das Luxus, Adrenalin und technische Perfektion vereint.",
      es: "Vive la emoción única de conducir dos iconos de la velocidad y el diseño italiano: el Ferrari California y el Ferrari 458 Italia. El California, elegante Gran Turismo de 4 plazas, combina confort y potencia con su motor V8 delantero-central, permitiéndote compartir la experiencia con dos pasajeros. El 458 Italia, en cambio, encarna la pura esencia deportiva: su V8 de 570 caballos a 9.000 rpm transforma cada aceleración en una emoción inolvidable. Dos coches, dos almas, una experiencia exclusiva en carretera que une lujo, adrenalina y perfección de ingeniería."
    },
    
    // California + California T
    "Un'esperienza che unisce due anime della stessa leggenda. La Ferrari California rappresenta l'eleganza Gran Turismo firmata Maranello, con il suo V8 anteriore e il comfort dei quattro posti che permettono di condividere l'emozione del Test Drive. La California T ne evolve il carattere con il potente V8 biturbo, offrendo prestazioni superiori e una risposta più sportiva.\nQuesta combinazione è ideale per chi desidera vivere un percorso completo: dalla raffinatezza della guida open-air alla spinta decisa del turbo, in un mix perfetto di lusso e adrenalina.": {
      en: "An experience that unites two souls of the same legend. The Ferrari California represents Gran Turismo elegance signed by Maranello, with its front V8 and the comfort of four seats that allow you to share the Test Drive emotion. The California T evolves its character with the powerful twin-turbo V8, offering superior performance and a more sporting response.\nThis combination is ideal for those who want to experience a complete journey: from the refinement of open-air driving to the decisive thrust of the turbo, in a perfect mix of luxury and adrenaline.",
      fr: "Une expérience qui unit deux âmes de la même légende. La Ferrari California représente l'élégance Gran Turismo signée Maranello, avec son V8 avant et le confort de quatre places qui permettent de partager l'émotion du Test Drive. La California T fait évoluer son caractère avec le puissant V8 biturbo, offrant des performances supérieures et une réponse plus sportive.\nCette combinaison est idéale pour ceux qui souhaitent vivre un parcours complet : du raffinement de la conduite à ciel ouvert à la poussée décisive du turbo, dans un mélange parfait de luxe et d'adrénaline.",
      de: "Ein Erlebnis, das zwei Seelen derselben Legende vereint. Der Ferrari California repräsentiert Gran Turismo-Eleganz von Maranello, mit seinem V8-Frontmotor und dem Komfort von vier Sitzen, die es ermöglichen, die Emotion der Testfahrt zu teilen. Der California T entwickelt seinen Charakter mit dem leistungsstarken Biturbo-V8 weiter und bietet überlegene Leistung und eine sportlichere Reaktion.\nDiese Kombination ist ideal für diejenigen, die eine vollständige Reise erleben möchten: von der Raffinesse des Fahrens mit offenem Verdeck bis zum entscheidenden Schub des Turbos, in einer perfekten Mischung aus Luxus und Adrenalin.",
      es: "Una experiencia que une dos almas de la misma leyenda. El Ferrari California representa la elegancia Gran Turismo firmada por Maranello, con su V8 delantero y el confort de cuatro plazas que permiten compartir la emoción del Test Drive. El California T evoluciona su carácter con el potente V8 biturbo, ofreciendo prestaciones superiores y una respuesta más deportiva.\nEsta combinación es ideal para quienes desean vivir un recorrido completo: del refinamiento de la conducción al aire libre al empuje decidido del turbo, en una mezcla perfecta de lujo y adrenalina."
    },
    
    // California + 488 Spider
    "Il fascino della Gran Turismo incontra l'anima più estrema delle supersportive Ferrari. La California accoglie il pilota con il suo equilibrio tra comfort e sportività, mentre la 488 Spider sprigiona tutta la potenza dei suoi 670 cavalli in configurazione scoperta.\nUn'esperienza che permette di passare dalla guida elegante e rilassata a quella più pura e aggressiva, sentendo l'asfalto vibrare sotto le ruote e il motore urlare alle spalle. Una doppia emozione che esalta ogni chilometro.": {
      en: "The charm of Gran Turismo meets the most extreme soul of Ferrari supercars. The California welcomes the driver with its balance between comfort and sportiness, while the 488 Spider unleashes all the power of its 670 horses in open configuration.\nAn experience that allows you to switch from elegant and relaxed driving to the purest and most aggressive, feeling the asphalt vibrate under the wheels and the engine roar behind you. A double emotion that enhances every kilometer.",
      fr: "Le charme de la Gran Turismo rencontre l'âme la plus extrême des supersportives Ferrari. La California accueille le pilote avec son équilibre entre confort et sportivité, tandis que la 488 Spider libère toute la puissance de ses 670 chevaux en configuration découverte.\nUne expérience qui permet de passer d'une conduite élégante et détendue à la plus pure et agressive, en sentant l'asphalte vibrer sous les roues et le moteur rugir dans le dos. Une double émotion qui exalte chaque kilomètre.",
      de: "Der Charme des Gran Turismo trifft auf die extremste Seele der Ferrari-Supersportwagen. Der California empfängt den Fahrer mit seiner Balance zwischen Komfort und Sportlichkeit, während der 488 Spider die gesamte Kraft seiner 670 PS in offener Konfiguration entfesselt.\nEin Erlebnis, das es ermöglicht, von eleganter und entspannter Fahrweise zur reinsten und aggressivsten zu wechseln, wobei man den Asphalt unter den Rädern vibrieren und den Motor hinter sich brüllen spürt. Eine doppelte Emotion, die jeden Kilometer bereichert.",
      es: "El encanto del Gran Turismo se encuentra con el alma más extrema de los superdeportivos Ferrari. El California acoge al piloto con su equilibrio entre confort y deportividad, mientras el 488 Spider libera toda la potencia de sus 670 caballos en configuración descubierta.\nUna experiencia que permite pasar de la conducción elegante y relajada a la más pura y agresiva, sintiendo el asfalto vibrar bajo las ruedas y el motor rugir a tus espaldas. Una doble emoción que exalta cada kilómetro."
    },
    
    // California + Portofino
    "Due interpretazioni diverse dello stile Gran Turismo Ferrari. La California è la pioniera della categoria, la Portofino ne rappresenta l'evoluzione moderna: più potente, più leggera, ancora più affascinante.\nQuesta combinazione offre un viaggio tra tradizione e innovazione, dove il comfort dei quattro posti si fonde con prestazioni sempre più decise. Perfetta per chi vuole assaporare la dolcezza della guida Ferrari senza rinunciare al carattere sportivo.": {
      en: "Two different interpretations of Ferrari Gran Turismo style. The California is the pioneer of the category, the Portofino represents its modern evolution: more powerful, lighter, even more captivating.\nThis combination offers a journey between tradition and innovation, where four-seat comfort merges with increasingly decisive performance. Perfect for those who want to savor the sweetness of Ferrari driving without sacrificing sporting character.",
      fr: "Deux interprétations différentes du style Gran Turismo Ferrari. La California est la pionnière de la catégorie, la Portofino en représente l'évolution moderne : plus puissante, plus légère, encore plus fascinante.\nCette combinaison offre un voyage entre tradition et innovation, où le confort de quatre places se fusionne avec des performances toujours plus décisives. Parfaite pour ceux qui veulent savourer la douceur de la conduite Ferrari sans renoncer au caractère sportif.",
      de: "Zwei unterschiedliche Interpretationen des Ferrari Gran Turismo-Stils. Der California ist der Pionier der Kategorie, der Portofino repräsentiert seine moderne Evolution: leistungsstärker, leichter, noch faszinierender.\nDiese Kombination bietet eine Reise zwischen Tradition und Innovation, bei der Viersitzer-Komfort mit zunehmend entscheidender Leistung verschmilzt. Perfekt für diejenigen, die die Süße des Ferrari-Fahrens genießen möchten, ohne auf sportlichen Charakter zu verzichten.",
      es: "Dos interpretaciones diferentes del estilo Gran Turismo Ferrari. El California es el pionero de la categoría, el Portofino representa su evolución moderna: más potente, más ligero, aún más fascinante.\nEsta combinación ofrece un viaje entre tradición e innovación, donde el confort de cuatro plazas se fusiona con prestaciones cada vez más decididas. Perfecta para quien quiere saborear la dulzura de la conducción Ferrari sin renunciar al carácter deportivo."
    },
    
    // California + Huracán
    "Eleganza italiana contro aggressività pura. La Ferrari California conquista con il suo stile raffinato e la sua versatilità, mentre la Huracán Spyder sprigiona tutta la sua potenza scenografica con il V10 Lamborghini e il tetto aperto.\nUn Test Drive che mette a confronto due filosofie opposte: il lusso Gran Turismo e la supercar estrema. Un'esperienza emozionale unica, dove ogni accelerazione diventa un ricordo indelebile.": {
      en: "Italian elegance versus pure aggression. The Ferrari California conquers with its refined style and versatility, while the Huracán Spyder unleashes all its spectacular power with the Lamborghini V10 and open roof.\nA Test Drive that compares two opposite philosophies: Gran Turismo luxury and extreme supercar. A unique emotional experience, where every acceleration becomes an indelible memory.",
      fr: "Élégance italienne contre agressivité pure. La Ferrari California conquiert avec son style raffiné et sa polyvalence, tandis que l'Huracán Spyder libère toute sa puissance scénographique avec le V10 Lamborghini et le toit ouvert.\nUn Test Drive qui compare deux philosophies opposées : le luxe Gran Turismo et la supercar extrême. Une expérience émotionnelle unique, où chaque accélération devient un souvenir indélébile.",
      de: "Italienische Eleganz gegen pure Aggressivität. Der Ferrari California erobert mit seinem raffinierten Stil und seiner Vielseitigkeit, während der Huracán Spyder seine gesamte spektakuläre Kraft mit dem Lamborghini V10 und offenem Dach entfesselt.\nEine Testfahrt, die zwei gegensätzliche Philosophien vergleicht: Gran Turismo-Luxus und extremer Supersportwagen. Ein einzigartiges emotionales Erlebnis, bei dem jede Beschleunigung zu einer unvergesslichen Erinnerung wird.",
      es: "Elegancia italiana contra agresividad pura. El Ferrari California conquista con su estilo refinado y su versatilidad, mientras el Huracán Spyder libera toda su potencia escenográfica con el V10 Lamborghini y techo abierto.\nUn Test Drive que compara dos filosofías opuestas: el lujo Gran Turismo y el superdeportivo extremo. Una experiencia emocional única, donde cada aceleración se convierte en un recuerdo indeleble."
    },
    
    // California T + 458 Spider
    "La modernità del turbo incontra la purezza del motore aspirato. La California T sorprende per la sua spinta fluida e potente, mentre la 458 Spider incanta con il suo V8 urlante e la guida estrema a cielo aperto.\nQuesta combinazione permette di vivere due anime Ferrari in un'unica esperienza: il comfort sportivo e la performance pura, per un Test Drive che evolve curva dopo curva.": {
      en: "The modernity of turbo meets the purity of naturally aspirated engine. The California T surprises with its fluid and powerful thrust, while the 458 Spider enchants with its screaming V8 and extreme open-air driving.\nThis combination allows you to experience two Ferrari souls in a single experience: sporting comfort and pure performance, for a Test Drive that evolves curve after curve.",
      fr: "La modernité du turbo rencontre la pureté du moteur atmosphérique. La California T surprend par sa poussée fluide et puissante, tandis que la 458 Spider enchante avec son V8 hurlant et sa conduite extrême à ciel ouvert.\nCette combinaison permet de vivre deux âmes Ferrari en une seule expérience : le confort sportif et la performance pure, pour un Test Drive qui évolue virage après virage.",
      de: "Die Modernität des Turbos trifft auf die Reinheit des Saugmotors. Der California T überrascht mit seinem fließenden und kraftvollen Schub, während der 458 Spider mit seinem brüllenden V8 und extremem Fahren unter freiem Himmel verzaubert.\nDiese Kombination ermöglicht es, zwei Ferrari-Seelen in einem einzigen Erlebnis zu erleben: sportlichen Komfort und pure Leistung, für eine Testfahrt, die sich Kurve für Kurve entwickelt.",
      es: "La modernidad del turbo se encuentra con la pureza del motor atmosférico. El California T sorprende por su empuje fluido y potente, mientras el 458 Spider encanta con su V8 aullante y la conducción extrema al aire libre.\nEsta combinación permite vivir dos almas Ferrari en una única experiencia: el confort deportivo y el rendimiento puro, para un Test Drive que evoluciona curva tras curva."
    },
    
    // California T + 488 Spider
    "Due spider, due caratteri forti. La California T offre eleganza e coppia immediata grazie al suo V8 biturbo, mentre la 488 Spider rappresenta l'apice delle prestazioni Ferrari con 670 cavalli pronti a esplodere.\nUna combinazione pensata per chi vuole sentire la differenza tra sportività raffinata e supercar estrema, godendo del vento e del suono dei motori senza filtri.": {
      en: "Two spiders, two strong characters. The California T offers elegance and immediate torque thanks to its twin-turbo V8, while the 488 Spider represents the pinnacle of Ferrari performance with 670 horses ready to explode.\nA combination designed for those who want to feel the difference between refined sportiness and extreme supercar, enjoying the wind and the unfiltered sound of the engines.",
      fr: "Deux spiders, deux caractères forts. La California T offre élégance et couple immédiat grâce à son V8 biturbo, tandis que la 488 Spider représente le sommet des performances Ferrari avec 670 chevaux prêts à exploser.\nUne combinaison pensée pour ceux qui veulent sentir la différence entre sportivité raffinée et supercar extrême, en profitant du vent et du son des moteurs sans filtre.",
      de: "Zwei Spider, zwei starke Charaktere. Der California T bietet Eleganz und sofortiges Drehmoment dank seines Biturbo-V8, während der 488 Spider den Höhepunkt der Ferrari-Leistung mit 670 PS darstellt, die bereit sind zu explodieren.\nEine Kombination für diejenigen, die den Unterschied zwischen raffinierter Sportlichkeit und extremem Supersportwagen spüren möchten und dabei den Wind und den ungefilterten Klang der Motoren genießen.",
      es: "Dos spiders, dos caracteres fuertes. El California T ofrece elegancia y par inmediato gracias a su V8 biturbo, mientras el 488 Spider representa la cima del rendimiento Ferrari con 670 caballos listos para explotar.\nUna combinación pensada para quien quiere sentir la diferencia entre deportividad refinada y superdeportivo extremo, disfrutando del viento y el sonido sin filtros de los motores."
    },
    
    // California T + Portofino
    "Il meglio delle Gran Turismo Ferrari in versione moderna. La California T introduce il turbo con stile e potenza, mentre la Portofino alza l'asticella con un design ancora più affilato e prestazioni superiori.\nQuesta esperienza è un viaggio nel lusso sportivo Ferrari, dove comfort, tecnologia e adrenalina si fondono in un Test Drive esclusivo e raffinato.": {
      en: "The best of Ferrari Gran Turismo in modern version. The California T introduces turbo with style and power, while the Portofino raises the bar with an even sharper design and superior performance.\nThis experience is a journey into Ferrari sporting luxury, where comfort, technology and adrenaline merge in an exclusive and refined Test Drive.",
      fr: "Le meilleur des Gran Turismo Ferrari en version moderne. La California T introduit le turbo avec style et puissance, tandis que la Portofino élève la barre avec un design encore plus affûté et des performances supérieures.\nCette expérience est un voyage dans le luxe sportif Ferrari, où confort, technologie et adrénaline se fondent dans un Test Drive exclusif et raffiné.",
      de: "Das Beste des Ferrari Gran Turismo in moderner Version. Der California T führt Turbo mit Stil und Kraft ein, während der Portofino die Messlatte mit noch schärferem Design und überlegener Leistung erhöht.\nDieses Erlebnis ist eine Reise in den sportlichen Luxus von Ferrari, wo Komfort, Technologie und Adrenalin in einer exklusiven und raffinierten Testfahrt verschmelzen.",
      es: "Lo mejor del Gran Turismo Ferrari en versión moderna. El California T introduce el turbo con estilo y potencia, mientras el Portofino eleva el listón con un diseño aún más afilado y prestaciones superiores.\nEsta experiencia es un viaje al lujo deportivo Ferrari, donde confort, tecnología y adrenalina se fusionan en un Test Drive exclusivo y refinado."
    },
    
    // California T + Huracán
    "Una sfida tra due mondi: la raffinatezza Ferrari e l'aggressività Lamborghini. La California T accompagna con eleganza e fluidità, la Huracán Spyder travolge con il suo V10 e il suo design estremo.\nUn'esperienza ideale per chi vuole confrontare due icone dell'automobilismo sportivo italiano, vivendo emozioni completamente diverse in pochi chilometri.": {
      en: "A challenge between two worlds: Ferrari refinement and Lamborghini aggression. The California T accompanies with elegance and fluidity, the Huracán Spyder overwhelms with its V10 and its extreme design.\nAn ideal experience for those who want to compare two icons of Italian sports cars, experiencing completely different emotions in just a few kilometers.",
      fr: "Un défi entre deux mondes : le raffinement Ferrari et l'agressivité Lamborghini. La California T accompagne avec élégance et fluidité, l'Huracán Spyder bouleverse avec son V10 et son design extrême.\nUne expérience idéale pour ceux qui veulent comparer deux icônes de l'automobile sportive italienne, en vivant des émotions complètement différentes en quelques kilomètres.",
      de: "Eine Herausforderung zwischen zwei Welten: Ferrari-Raffinesse und Lamborghini-Aggressivität. Der California T begleitet mit Eleganz und Flüssigkeit, der Huracán Spyder überwältigt mit seinem V10 und seinem extremen Design.\nEin ideales Erlebnis für diejenigen, die zwei Ikonen des italienischen Sportwagenbaus vergleichen möchten und dabei in wenigen Kilometern völlig unterschiedliche Emotionen erleben.",
      es: "Un desafío entre dos mundos: el refinamiento Ferrari y la agresividad Lamborghini. El California T acompaña con elegancia y fluidez, el Huracán Spyder arrolla con su V10 y su diseño extremo.\nUna experiencia ideal para quien quiere comparar dos iconos del automovilismo deportivo italiano, viviendo emociones completamente diferentes en pocos kilómetros."
    },
    
    // Portofino + 458 Italia
    "La Gran Turismo moderna incontra una delle Ferrari più iconiche di sempre. La Portofino accoglie con comfort e stile, la 458 Italia sprigiona il carattere puro del V8 aspirato a 9.000 giri.\nUn percorso che unisce eleganza e prestazioni estreme, permettendo di assaporare due epoche Ferrari in un'unica esperienza esclusiva.": {
      en: "Modern Gran Turismo meets one of the most iconic Ferraris ever. The Portofino welcomes with comfort and style, the 458 Italia unleashes the pure character of the naturally aspirated V8 at 9,000 rpm.\nA journey that combines elegance and extreme performance, allowing you to savor two Ferrari eras in a single exclusive experience.",
      fr: "La Gran Turismo moderne rencontre l'une des Ferrari les plus iconiques de tous les temps. La Portofino accueille avec confort et style, la 458 Italia libère le caractère pur du V8 atmosphérique à 9 000 tr/min.\nUn parcours qui unit élégance et performances extrêmes, permettant de savourer deux époques Ferrari en une seule expérience exclusive.",
      de: "Moderner Gran Turismo trifft auf einen der ikonischsten Ferraris aller Zeiten. Der Portofino empfängt mit Komfort und Stil, der 458 Italia entfesselt den reinen Charakter des Saugmotors V8 bei 9.000 U/min.\nEine Reise, die Eleganz und extreme Leistung vereint und es ermöglicht, zwei Ferrari-Epochen in einem einzigen exklusiven Erlebnis zu genießen.",
      es: "El Gran Turismo moderno se encuentra con uno de los Ferrari más icónicos de todos los tiempos. El Portofino acoge con confort y estilo, el 458 Italia libera el carácter puro del V8 atmosférico a 9.000 rpm.\nUn recorrido que une elegancia y prestaciones extremas, permitiendo saborear dos épocas Ferrari en una única experiencia exclusiva."
    },
    
    // Portofino + 488 Spider
    "Due generazioni di potenza Ferrari a confronto. La Portofino sorprende per la sua versatilità e il suo V8 turbo, mentre la 488 Spider incarna l'anima racing del marchio con prestazioni mozzafiato.\nUna combinazione pensata per chi desidera un Test Drive completo: comfort, design e pura adrenalina in configurazione scoperta.": {
      en: "Two generations of Ferrari power compared. The Portofino surprises with its versatility and turbo V8, while the 488 Spider embodies the racing soul of the brand with breathtaking performance.\nA combination designed for those who want a complete Test Drive: comfort, design and pure adrenaline in open configuration.",
      fr: "Deux générations de puissance Ferrari comparées. La Portofino surprend par sa polyvalence et son V8 turbo, tandis que la 488 Spider incarne l'âme racing de la marque avec des performances à couper le souffle.\nUne combinaison pensée pour ceux qui désirent un Test Drive complet : confort, design et pure adrénaline en configuration découverte.",
      de: "Zwei Generationen Ferrari-Kraft im Vergleich. Der Portofino überrascht mit seiner Vielseitigkeit und seinem Turbo-V8, während der 488 Spider die Rennseele der Marke mit atemberaubender Leistung verkörpert.\nEine Kombination für diejenigen, die eine vollständige Testfahrt wünschen: Komfort, Design und pure Adrenalin in offener Konfiguration.",
      es: "Dos generaciones de potencia Ferrari comparadas. El Portofino sorprende por su versatilidad y su V8 turbo, mientras el 488 Spider encarna el alma racing de la marca con prestaciones impresionantes.\nUna combinación pensada para quien desea un Test Drive completo: confort, diseño y pura adrenalina en configuración descubierta."
    },
    
    // Portofino + Huracán
    "Classe ed eleganza contro istinto e aggressività. La Portofino accompagna con il suo stile raffinato, la Huracán Spyder conquista con il rombo del V10 e la sua presenza scenica.\nUn'esperienza che mette a confronto due icone del lusso sportivo italiano, regalando sensazioni forti e contrastanti, perfette per chi cerca il massimo dell'emozione.": {
      en: "Class and elegance versus instinct and aggression. The Portofino accompanies with its refined style, the Huracán Spyder conquers with the roar of the V10 and its scenic presence.\nAn experience that compares two icons of Italian sporting luxury, offering strong and contrasting sensations, perfect for those seeking maximum emotion.",
      fr: "Classe et élégance contre instinct et agressivité. La Portofino accompagne avec son style raffiné, l'Huracán Spyder conquiert avec le rugissement du V10 et sa présence scénique.\nUne expérience qui compare deux icônes du luxe sportif italien, offrant des sensations fortes et contrastées, parfaites pour ceux qui recherchent le maximum d'émotion.",
      de: "Klasse und Eleganz gegen Instinkt und Aggressivität. Der Portofino begleitet mit seinem raffinierten Stil, der Huracán Spyder erobert mit dem Gebrüll des V10 und seiner szenischen Präsenz.\nEin Erlebnis, das zwei Ikonen des italienischen Sportluxus vergleicht und starke und kontrastierende Empfindungen bietet, perfekt für diejenigen, die maximale Emotionen suchen.",
      es: "Clase y elegancia contra instinto y agresividad. El Portofino acompaña con su estilo refinado, el Huracán Spyder conquista con el rugido del V10 y su presencia escénica.\nUna experiencia que compara dos iconos del lujo deportivo italiano, regalando sensaciones fuertes y contrastantes, perfectas para quien busca el máximo de emoción."
    },
    
    // 458 Italia + 488 Spider
    "Due leggende Ferrari, due filosofie di potenza. La 458 Italia rappresenta l'ultima grande era del V8 aspirato, mentre la 488 Spider porta il turbo a livelli estremi.\nUn Test Drive che permette di percepire l'evoluzione delle prestazioni Ferrari, tra sound puro e coppia brutale, in una combinazione riservata ai veri appassionati.": {
      en: "Two Ferrari legends, two power philosophies. The 458 Italia represents the last great era of naturally aspirated V8, while the 488 Spider takes turbo to extreme levels.\nA Test Drive that allows you to perceive the evolution of Ferrari performance, between pure sound and brutal torque, in a combination reserved for true enthusiasts.",
      fr: "Deux légendes Ferrari, deux philosophies de puissance. La 458 Italia représente la dernière grande ère du V8 atmosphérique, tandis que la 488 Spider porte le turbo à des niveaux extrêmes.\nUn Test Drive qui permet de percevoir l'évolution des performances Ferrari, entre son pur et couple brutal, dans une combinaison réservée aux vrais passionnés.",
      de: "Zwei Ferrari-Legenden, zwei Kraftphilosophien. Der 458 Italia repräsentiert die letzte große Ära des Saugmotor-V8, während der 488 Spider Turbo auf extreme Levels bringt.\nEine Testfahrt, die es ermöglicht, die Evolution der Ferrari-Leistung zwischen reinem Sound und brutalem Drehmoment wahrzunehmen, in einer Kombination, die echten Enthusiasten vorbehalten ist.",
      es: "Dos leyendas Ferrari, dos filosofías de potencia. El 458 Italia representa la última gran era del V8 atmosférico, mientras el 488 Spider lleva el turbo a niveles extremos.\nUn Test Drive que permite percibir la evolución de las prestaciones Ferrari, entre sonido puro y par brutal, en una combinación reservada a los verdaderos apasionados."
    },
    
    // 458 Italia + Huracán
    "Il duello tra Maranello e Sant'Agata. La 458 Italia affascina con la sua precisione di guida e il suo V8 urlante, la Huracán Spyder impressiona con il V10 e il suo carattere aggressivo.\nUn'esperienza esclusiva che mette a confronto due visioni della supercar, regalando emozioni forti e contrastanti in ogni accelerazione.": {
      en: "The duel between Maranello and Sant'Agata. The 458 Italia fascinates with its driving precision and screaming V8, the Huracán Spyder impresses with the V10 and its aggressive character.\nAn exclusive experience that compares two supercar visions, offering strong and contrasting emotions with every acceleration.",
      fr: "Le duel entre Maranello et Sant'Agata. La 458 Italia fascine avec sa précision de conduite et son V8 hurlant, l'Huracán Spyder impressionne avec le V10 et son caractère agressif.\nUne expérience exclusive qui compare deux visions de la supercar, offrant des émotions fortes et contrastées à chaque accélération.",
      de: "Das Duell zwischen Maranello und Sant'Agata. Der 458 Italia fasziniert mit seiner Fahrpräzision und brüllendem V8, der Huracán Spyder beeindruckt mit dem V10 und seinem aggressiven Charakter.\nEin exklusives Erlebnis, das zwei Supersportwagen-Visionen vergleicht und bei jeder Beschleunigung starke und kontrastierende Emotionen bietet.",
      es: "El duelo entre Maranello y Sant'Agata. El 458 Italia fascina con su precisión de conducción y su V8 aullante, el Huracán Spyder impresiona con el V10 y su carácter agresivo.\nUna experiencia exclusiva que compara dos visiones del superdeportivo, regalando emociones fuertes y contrastantes en cada aceleración."
    },
    
    // 488 Spider + Huracán
    "Il massimo delle supersportive scoperte. La 488 Spider esprime tutta la potenza Ferrari con 670 cavalli, la Huracán Spyder risponde con il rombo inconfondibile del V10 Lamborghini.\nUn Test Drive pensato per chi vuole il vertice assoluto dell'adrenalina, tra design estremo, prestazioni mozzafiato e sensazioni senza compromessi.": {
      en: "The ultimate in open supercars. The 488 Spider expresses all Ferrari power with 670 horses, the Huracán Spyder responds with the unmistakable roar of the Lamborghini V10.\nA Test Drive designed for those who want the absolute peak of adrenaline, between extreme design, breathtaking performance and uncompromising sensations.",
      fr: "Le summum des supersportives découvertes. La 488 Spider exprime toute la puissance Ferrari avec 670 chevaux, l'Huracán Spyder répond avec le rugissement inimitable du V10 Lamborghini.\nUn Test Drive pensé pour ceux qui veulent le sommet absolu de l'adrénaline, entre design extrême, performances à couper le souffle et sensations sans compromis.",
      de: "Das Ultimative an offenen Supersportwagen. Der 488 Spider drückt die gesamte Ferrari-Kraft mit 670 PS aus, der Huracán Spyder antwortet mit dem unverwechselbaren Brüllen des Lamborghini V10.\nEine Testfahrt für diejenigen, die den absoluten Höhepunkt des Adrenalins wollen, zwischen extremem Design, atemberaubender Leistung und kompromisslosen Empfindungen.",
      es: "El máximo de los superdeportivos descubiertos. El 488 Spider expresa toda la potencia Ferrari con 670 caballos, el Huracán Spyder responde con el rugido inconfundible del V10 Lamborghini.\nUn Test Drive pensado para quien quiere la cima absoluta de la adrenalina, entre diseño extremo, prestaciones impresionantes y sensaciones sin compromisos."
    },
    
    // Ferrari California (singola)
    "Vivi l'emozione di guidare la Ferrari California, elegante Gran Turismo a 4 posti che unisce design raffinato e potenza pura. Con il suo motore V8 anteriore centrale, 490 CV e un'accelerazione da 0 a 100 km/h in soli 3,8 secondi, offre un'esperienza su strada emozionante e senza compromessi. Grazie ai sedili posteriori, puoi condividere questo viaggio unico con amici o familiari, trasformando ogni curva in un momento indimenticabile. Una vettura iconica, simbolo di stile e performance, pronta a regalarti il brivido autentico del Cavallino Rampante.": {
      en: "Experience the thrill of driving the Ferrari California, an elegant 4-seater Gran Turismo that combines refined design and pure power. With its front-mid V8 engine, 490 HP and acceleration from 0 to 100 km/h in just 3.8 seconds, it offers an exciting and uncompromising road experience. Thanks to the rear seats, you can share this unique journey with friends or family, transforming every curve into an unforgettable moment. An iconic car, symbol of style and performance, ready to give you the authentic thrill of the Prancing Horse.",
      fr: "Vivez l'émotion de conduire la Ferrari California, élégante Gran Turismo 4 places qui allie design raffiné et puissance pure. Avec son moteur V8 avant-central, 490 CV et une accélération de 0 à 100 km/h en seulement 3,8 secondes, elle offre une expérience routière passionnante et sans compromis. Grâce aux sièges arrière, vous pouvez partager ce voyage unique avec des amis ou la famille, transformant chaque virage en un moment inoubliable. Une voiture iconique, symbole de style et de performance, prête à vous offrir le frisson authentique du Cheval Cabré.",
      de: "Erleben Sie den Nervenkitzel, den Ferrari California zu fahren, einen eleganten 4-sitzigen Gran Turismo, der raffiniertes Design und pure Kraft vereint. Mit seinem mittigen V8-Frontmotor, 490 PS und Beschleunigung von 0 auf 100 km/h in nur 3,8 Sekunden bietet er ein aufregendes und kompromissloses Straßenerlebnis. Dank der Rücksitze können Sie diese einzigartige Reise mit Freunden oder Familie teilen und jede Kurve in einen unvergesslichen Moment verwandeln. Ein ikonisches Auto, Symbol für Stil und Leistung, bereit, Ihnen den authentischen Nervenkitzel des Cavallino Rampante zu bieten.",
      es: "Vive la emoción de conducir el Ferrari California, elegante Gran Turismo de 4 plazas que combina diseño refinado y potencia pura. Con su motor V8 delantero-central, 490 CV y una aceleración de 0 a 100 km/h en solo 3,8 segundos, ofrece una experiencia en carretera emocionante y sin compromisos. Gracias a los asientos traseros, puedes compartir este viaje único con amigos o familiares, transformando cada curva en un momento inolvidable. Un coche icónico, símbolo de estilo y rendimiento, listo para regalarte la emoción auténtica del Cavallino Rampante."
    },
    
    // Ferrari Portofino
    "Scopri la Ferrari Portofino, icona Gran Turismo che unisce eleganza e potenza senza compromessi. Il V8 bi-turbo da 600 CV e l'accelerazione fulminea da 0 a 100 km/h in soli 3,5 secondi offrono un'esperienza di guida emozionante, mentre le linee ispirate alla 365 GTB/4 Daytona e alla 812 Superfast trasmettono stile e raffinatezza. Una vettura perfetta per chi cerca lusso, comfort e prestazioni su strada.": {
      en: "Discover the Ferrari Portofino, Gran Turismo icon that combines elegance and power without compromise. The 600 HP twin-turbo V8 and lightning acceleration from 0 to 100 km/h in just 3.5 seconds offer an exciting driving experience, while lines inspired by the 365 GTB/4 Daytona and 812 Superfast convey style and refinement. A perfect car for those seeking luxury, comfort and road performance.",
      fr: "Découvrez la Ferrari Portofino, icône Gran Turismo qui allie élégance et puissance sans compromis. Le V8 bi-turbo de 600 CV et l'accélération fulgurante de 0 à 100 km/h en seulement 3,5 secondes offrent une expérience de conduite passionnante, tandis que les lignes inspirées de la 365 GTB/4 Daytona et de la 812 Superfast transmettent style et raffinement. Une voiture parfaite pour ceux qui recherchent luxe, confort et performances sur route.",
      de: "Entdecken Sie den Ferrari Portofino, Gran Turismo-Ikone, die Eleganz und Kraft ohne Kompromisse vereint. Der 600 PS starke Biturbo-V8 und die blitzschnelle Beschleunigung von 0 auf 100 km/h in nur 3,5 Sekunden bieten ein aufregendes Fahrerlebnis, während die vom 365 GTB/4 Daytona und 812 Superfast inspirierten Linien Stil und Raffinesse vermitteln. Ein perfektes Auto für diejenigen, die Luxus, Komfort und Straßenleistung suchen.",
      es: "Descubre el Ferrari Portofino, icono Gran Turismo que combina elegancia y potencia sin compromisos. El V8 bi-turbo de 600 CV y la aceleración fulminante de 0 a 100 km/h en solo 3,5 segundos ofrecen una experiencia de conducción emocionante, mientras las líneas inspiradas en el 365 GTB/4 Daytona y el 812 Superfast transmiten estilo y refinamiento. Un coche perfecto para quien busca lujo, confort y prestaciones en carretera."
    },
    
    // Ferrari 488 Spider
    "Vivi la Ferrari 488 Spider, capolavoro sportivo e tecnologico, con motore V8 da 670 CV che spinge fino a 327 km/h. Ogni curva e ogni accelerazione regalano emozioni pure, mentre il design filante e l'esperienza open-air trasformano ogni test drive in un momento esclusivo e indimenticabile.": {
      en: "Experience the Ferrari 488 Spider, sporting and technological masterpiece, with 670 HP V8 engine that pushes up to 327 km/h. Every curve and every acceleration offers pure emotions, while the streamlined design and open-air experience transform every test drive into an exclusive and unforgettable moment.",
      fr: "Vivez la Ferrari 488 Spider, chef-d'œuvre sportif et technologique, avec moteur V8 de 670 CV qui pousse jusqu'à 327 km/h. Chaque virage et chaque accélération offrent des émotions pures, tandis que le design filant et l'expérience à ciel ouvert transforment chaque test drive en un moment exclusif et inoubliable.",
      de: "Erleben Sie den Ferrari 488 Spider, sportliches und technologisches Meisterwerk, mit 670 PS V8-Motor, der bis zu 327 km/h erreicht. Jede Kurve und jede Beschleunigung bietet pure Emotionen, während das stromlinienförmige Design und das Open-Air-Erlebnis jede Testfahrt in einen exklusiven und unvergesslichen Moment verwandeln.",
      es: "Vive el Ferrari 488 Spider, obra maestra deportiva y tecnológica, con motor V8 de 670 CV que alcanza hasta 327 km/h. Cada curva y cada aceleración regalan emociones puras, mientras el diseño afilado y la experiencia al aire libre transforman cada test drive en un momento exclusivo e inolvidable."
    },
    
    // Ferrari 458 Italia
    "Guidare la Ferrari 458 Italia significa entrare in contatto con la pura essenza sportiva. Con 570 CV a 9.000 giri/min e accelerazione inferiore a 3,4 secondi, questa berlinetta a due posti combina potenza e precisione, regalando adrenalina pura e uno stile senza tempo, simbolo dell'ingegneria Ferrari.": {
      en: "Driving the Ferrari 458 Italia means getting in touch with pure sporting essence. With 570 HP at 9,000 rpm and acceleration under 3.4 seconds, this two-seater berlinetta combines power and precision, offering pure adrenaline and timeless style, symbol of Ferrari engineering.",
      fr: "Conduire la Ferrari 458 Italia signifie entrer en contact avec la pure essence sportive. Avec 570 CV à 9 000 tr/min et une accélération inférieure à 3,4 secondes, cette berlinette deux places combine puissance et précision, offrant de l'adrénaline pure et un style intemporel, symbole de l'ingénierie Ferrari.",
      de: "Den Ferrari 458 Italia zu fahren bedeutet, mit purer sportlicher Essenz in Kontakt zu kommen. Mit 570 PS bei 9.000 U/min und Beschleunigung unter 3,4 Sekunden kombiniert diese zweisitzige Berlinetta Kraft und Präzision und bietet pures Adrenalin und zeitlosen Stil, Symbol der Ferrari-Technik.",
      es: "Conducir el Ferrari 458 Italia significa entrar en contacto con la pura esencia deportiva. Con 570 CV a 9.000 rpm y aceleración inferior a 3,4 segundos, esta berlinetta de dos plazas combina potencia y precisión, regalando adrenalina pura y un estilo atemporal, símbolo de la ingeniería Ferrari."
    },
    
    // Ferrari California T
    "La Ferrari California T unisce potenza e versatilità in un elegante design Gran Turismo a 4 posti. Il V8 sovralimentato da 560 CV e la velocità massima di 316 km/h garantiscono emozioni straordinarie, mentre la possibilità di condividere l'esperienza con passeggeri rende ogni viaggio unico e raffinato.": {
      en: "The Ferrari California T combines power and versatility in an elegant 4-seater Gran Turismo design. The 560 HP supercharged V8 and maximum speed of 316 km/h guarantee extraordinary emotions, while the possibility of sharing the experience with passengers makes every journey unique and refined.",
      fr: "La Ferrari California T allie puissance et polyvalence dans un design élégant Gran Turismo 4 places. Le V8 suralimenté de 560 CV et la vitesse maximale de 316 km/h garantissent des émotions extraordinaires, tandis que la possibilité de partager l'expérience avec des passagers rend chaque voyage unique et raffiné.",
      de: "Der Ferrari California T vereint Kraft und Vielseitigkeit in einem eleganten 4-sitzigen Gran Turismo-Design. Der 560 PS starke aufgeladene V8 und die Höchstgeschwindigkeit von 316 km/h garantieren außergewöhnliche Emotionen, während die Möglichkeit, das Erlebnis mit Passagieren zu teilen, jede Fahrt einzigartig und raffiniert macht.",
      es: "El Ferrari California T combina potencia y versatilidad en un elegante diseño Gran Turismo de 4 plazas. El V8 sobrealimentado de 560 CV y la velocidad máxima de 316 km/h garantizan emociones extraordinarias, mientras la posibilidad de compartir la experiencia con pasajeros hace cada viaje único y refinado."
    },
    
    // Lamborghini Huracán Spyder
    "Senti l'adrenalina della Lamborghini Huracán Spyder, un capolavoro V10 da 610 CV con accelerazione 0-100 km/h in 3,4 secondi. Linee aggressive e telaio in fibra di carbonio offrono precisione e stile senza compromessi, mentre la guida open-air trasforma ogni curva in un'emozione esclusiva e indimenticabile.": {
      en: "Feel the adrenaline of the Lamborghini Huracán Spyder, a 610 HP V10 masterpiece with 0-100 km/h acceleration in 3.4 seconds. Aggressive lines and carbon fiber chassis offer uncompromising precision and style, while open-air driving transforms every curve into an exclusive and unforgettable emotion.",
      fr: "Ressentez l'adrénaline de la Lamborghini Huracán Spyder, un chef-d'œuvre V10 de 610 CV avec accélération 0-100 km/h en 3,4 secondes. Des lignes agressives et un châssis en fibre de carbone offrent précision et style sans compromis, tandis que la conduite à ciel ouvert transforme chaque virage en une émotion exclusive et inoubliable.",
      de: "Spüren Sie das Adrenalin des Lamborghini Huracán Spyder, ein 610 PS V10-Meisterwerk mit 0-100 km/h-Beschleunigung in 3,4 Sekunden. Aggressive Linien und Carbonfaser-Chassis bieten kompromisslose Präzision und Stil, während das Fahren unter freiem Himmel jede Kurve in eine exklusive und unvergessliche Emotion verwandelt.",
      es: "Siente la adrenalina del Lamborghini Huracán Spyder, una obra maestra V10 de 610 CV con aceleración 0-100 km/h en 3,4 segundos. Líneas agresivas y chasis de fibra de carbono ofrecen precisión y estilo sin compromisos, mientras la conducción al aire libre transforma cada curva en una emoción exclusiva e inolvidable."
    },
    
    // Ferrari 458 Spider
    "La Ferrari 458 Spider incarna tecnologia, stile e performance pura. Con 570 CV, 0-100 km/h in 3,4 secondi e velocità massima di 320 km/h, questa spider a due posti offre un'esperienza di guida sportiva e raffinata, dove ogni accelerazione è un brivido unico e sofisticato.": {
      en: "The Ferrari 458 Spider embodies technology, style and pure performance. With 570 HP, 0-100 km/h in 3.4 seconds and maximum speed of 320 km/h, this two-seater spider offers a sporting and refined driving experience, where every acceleration is a unique and sophisticated thrill.",
      fr: "La Ferrari 458 Spider incarne technologie, style et performance pure. Avec 570 CV, 0-100 km/h en 3,4 secondes et vitesse maximale de 320 km/h, ce spider deux places offre une expérience de conduite sportive et raffinée, où chaque accélération est un frisson unique et sophistiqué.",
      de: "Der Ferrari 458 Spider verkörpert Technologie, Stil und pure Leistung. Mit 570 PS, 0-100 km/h in 3,4 Sekunden und Höchstgeschwindigkeit von 320 km/h bietet dieser zweisitzige Spider ein sportliches und raffiniertes Fahrerlebnis, bei dem jede Beschleunigung ein einzigartiger und anspruchsvoller Nervenkitzel ist.",
      es: "El Ferrari 458 Spider encarna tecnología, estilo y rendimiento puro. Con 570 CV, 0-100 km/h en 3,4 segundos y velocidad máxima de 320 km/h, este spider de dos plazas ofrece una experiencia de conducción deportiva y refinada, donde cada aceleración es una emoción única y sofisticada."
    },
    
    // Ferrari F8 Spider
    "La Ferrari F8 Spider celebra l'eccellenza delle berlinette Ferrari a due posti. Con 720 CV a 8.000 giri/min, accelerazione 0-200 km/h in 8,2 secondi e design aerodinamico derivato dalla F1, unisce prestazioni estreme e lusso, offrendo una guida emozionante, precisa e coinvolgente in ogni dettaglio.": {
      en: "The Ferrari F8 Spider celebrates the excellence of two-seater Ferrari berlinettas. With 720 HP at 8,000 rpm, 0-200 km/h acceleration in 8.2 seconds and aerodynamic design derived from F1, it combines extreme performance and luxury, offering exciting, precise and engaging driving in every detail.",
      fr: "La Ferrari F8 Spider célèbre l'excellence des berlinettes Ferrari deux places. Avec 720 CV à 8 000 tr/min, accélération 0-200 km/h en 8,2 secondes et design aérodynamique dérivé de la F1, elle allie performances extrêmes et luxe, offrant une conduite passionnante, précise et captivante dans chaque détail.",
      de: "Der Ferrari F8 Spider feiert die Exzellenz der zweisitzigen Ferrari-Berlinettas. Mit 720 PS bei 8.000 U/min, 0-200 km/h-Beschleunigung in 8,2 Sekunden und aerodynamischem Design aus der F1 vereint er extreme Leistung und Luxus und bietet ein aufregendes, präzises und fesselndes Fahrerlebnis in jedem Detail.",
      es: "El Ferrari F8 Spider celebra la excelencia de las berlinetta Ferrari de dos plazas. Con 720 CV a 8.000 rpm, aceleración 0-200 km/h en 8,2 segundos y diseño aerodinámico derivado de la F1, combina prestaciones extremas y lujo, ofreciendo una conducción emocionante, precisa y envolvente en cada detalle."
    },
    
    // Ferrari 296
    "Scopri la Ferrari 296, berlinetta 2 posti PHEV che unisce un V6 120° e motore elettrico per 830 CV totali. Compatta, moderna e tecnologica, offre prestazioni straordinarie e una guida entusiasmante su strada, dove agilità, accelerazione e suono del motore regalano un'esperienza unica e contemporanea.": {
      en: "Discover the Ferrari 296, 2-seater PHEV berlinetta that combines a 120° V6 and electric motor for 830 total HP. Compact, modern and technological, it offers extraordinary performance and exciting road driving, where agility, acceleration and engine sound provide a unique and contemporary experience.",
      fr: "Découvrez la Ferrari 296, berlinette 2 places PHEV qui allie un V6 120° et moteur électrique pour 830 CV au total. Compacte, moderne et technologique, elle offre des performances extraordinaires et une conduite routière passionnante, où agilité, accélération et son du moteur offrent une expérience unique et contemporaine.",
      de: "Entdecken Sie den Ferrari 296, eine 2-sitzige PHEV-Berlinetta, die einen 120° V6 und Elektromotor für insgesamt 830 PS kombiniert. Kompakt, modern und technologisch bietet er außergewöhnliche Leistung und aufregendes Straßenfahren, wo Agilität, Beschleunigung und Motorklang ein einzigartiges und zeitgemäßes Erlebnis bieten.",
      es: "Descubre el Ferrari 296, berlinetta 2 plazas PHEV que combina un V6 de 120° y motor eléctrico para 830 CV totales. Compacto, moderno y tecnológico, ofrece prestaciones extraordinarias y una conducción emocionante en carretera, donde agilidad, aceleración y sonido del motor regalan una experiencia única y contemporánea."
    },
    
    // Ferrari Roma
    "La Ferrari Roma unisce eleganza senza tempo e performance eccellenti. La coupé 2+ a motore anteriore-centrale da 620 CV offre accelerazione 0-100 km/h in 3,4 secondi, linee pure e interni raffinati Dual Cockpit. Una guida dinamica, confortevole e di lusso, simbolo dello stile italiano contemporaneo.": {
      en: "The Ferrari Roma combines timeless elegance and excellent performance. The 2+ front-mid engine coupé with 620 HP offers 0-100 km/h acceleration in 3.4 seconds, pure lines and refined Dual Cockpit interiors. Dynamic, comfortable and luxury driving, symbol of contemporary Italian style.",
      fr: "La Ferrari Roma allie élégance intemporelle et excellentes performances. Le coupé 2+ à moteur avant-central de 620 CV offre une accélération 0-100 km/h en 3,4 secondes, des lignes pures et des intérieurs raffinés Dual Cockpit. Une conduite dynamique, confortable et de luxe, symbole du style italien contemporain.",
      de: "Der Ferrari Roma vereint zeitlose Eleganz und hervorragende Leistung. Das 2+ Coupé mit mittlerem Frontmotor und 620 PS bietet 0-100 km/h-Beschleunigung in 3,4 Sekunden, pure Linien und raffinierte Dual Cockpit-Innenräume. Dynamisches, komfortables und luxuriöses Fahren, Symbol zeitgenössischen italienischen Stils.",
      es: "El Ferrari Roma combina elegancia atemporal y prestaciones excelentes. El coupé 2+ de motor delantero-central de 620 CV ofrece aceleración 0-100 km/h en 3,4 segundos, líneas puras e interiores refinados Dual Cockpit. Una conducción dinámica, confortable y de lujo, símbolo del estilo italiano contemporáneo."
    },
    
    // Maserati MC20 Cielo
    "Vivi l'esperienza Maserati MC20 Cielo, spider che combina accelerazione straordinaria, fino a 630 CV e 320 km/h, con lusso e libertà open-air. Design aerodinamico e tetto retrattile innovativo regalano sensazioni esclusive, mentre tecnologia e sicurezza garantiscono prestazioni senza compromessi sotto ogni aspetto.": {
      en: "Experience the Maserati MC20 Cielo, spider that combines extraordinary acceleration, up to 630 HP and 320 km/h, with luxury and open-air freedom. Aerodynamic design and innovative retractable roof offer exclusive sensations, while technology and safety guarantee uncompromising performance in every aspect.",
      fr: "Vivez l'expérience Maserati MC20 Cielo, spider qui combine accélération extraordinaire, jusqu'à 630 CV et 320 km/h, avec luxe et liberté à ciel ouvert. Design aérodynamique et toit rétractable innovant offrent des sensations exclusives, tandis que technologie et sécurité garantissent des performances sans compromis sous tous les aspects.",
      de: "Erleben Sie den Maserati MC20 Cielo, einen Spider, der außergewöhnliche Beschleunigung, bis zu 630 PS und 320 km/h, mit Luxus und Freiheit unter freiem Himmel kombiniert. Aerodynamisches Design und innovatives versenkbares Dach bieten exklusive Empfindungen, während Technologie und Sicherheit kompromisslose Leistung in jeder Hinsicht garantieren.",
      es: "Vive la experiencia Maserati MC20 Cielo, spider que combina aceleración extraordinaria, hasta 630 CV y 320 km/h, con lujo y libertad al aire libre. Diseño aerodinámico y techo retráctil innovador regalan sensaciones exclusivas, mientras tecnología y seguridad garantizan prestaciones sin compromisos bajo cada aspecto."
    },
    
    // McLaren 720S Performance
    "Scopri la McLaren 720S Performance, capolavoro aerodinamico e tecnologico da 717 CV, 0-100 km/h in soli 2,9 secondi e velocità massima 341 km/h. Design snello, precisione estrema e emozioni pure ad ogni curva trasformano la guida in un'esperienza esclusiva e spettacolare.": {
      en: "Discover the McLaren 720S Performance, aerodynamic and technological masterpiece with 717 HP, 0-100 km/h in just 2.9 seconds and maximum speed 341 km/h. Sleek design, extreme precision and pure emotions at every curve transform driving into an exclusive and spectacular experience.",
      fr: "Découvrez la McLaren 720S Performance, chef-d'œuvre aérodynamique et technologique de 717 CV, 0-100 km/h en seulement 2,9 secondes et vitesse maximale 341 km/h. Design élancé, précision extrême et émotions pures à chaque virage transforment la conduite en une expérience exclusive et spectaculaire.",
      de: "Entdecken Sie den McLaren 720S Performance, ein aerodynamisches und technologisches Meisterwerk mit 717 PS, 0-100 km/h in nur 2,9 Sekunden und Höchstgeschwindigkeit 341 km/h. Schlankes Design, extreme Präzision und pure Emotionen in jeder Kurve verwandeln das Fahren in ein exklusives und spektakuläres Erlebnis.",
      es: "Descubre el McLaren 720S Performance, obra maestra aerodinámica y tecnológica de 717 CV, 0-100 km/h en solo 2,9 segundos y velocidad máxima 341 km/h. Diseño elegante, precisión extrema y emociones puras en cada curva transforman la conducción en una experiencia exclusiva y espectacular."
    }
  },
  
  // =============================================
  // PRESTAZIONI (SPECS TECNICHE)
  // =============================================
  
  prestazioni: {
    "460 CV · 570 CV, 4.0s / 3.4s, 310 - 325+ km/h, Posteriore": {
      en: "460 HP · 570 HP, 4.0s / 3.4s, 310 - 325+ km/h, Rear",
      fr: "460 CV · 570 CV, 4,0s / 3,4s, 310 - 325+ km/h, Arrière",
      de: "460 PS · 570 PS, 4,0s / 3,4s, 310 - 325+ km/h, Hinterrad",
      es: "460 CV · 570 CV, 4,0s / 3,4s, 310 - 325+ km/h, Trasera"
    },
    "460 CV · 560 CV, 4.0s / 3.6s, 310 · 316 km/h, Posteriore": {
      en: "460 HP · 560 HP, 4.0s / 3.6s, 310 · 316 km/h, Rear",
      fr: "460 CV · 560 CV, 4,0s / 3,6s, 310 · 316 km/h, Arrière",
      de: "460 PS · 560 PS, 4,0s / 3,6s, 310 · 316 km/h, Hinterrad",
      es: "460 CV · 560 CV, 4,0s / 3,6s, 310 · 316 km/h, Trasera"
    },
    "460 CV · 670 CV, 4.0s / 3.0s, 310 · 325 km/h, Posteriore": {
      en: "460 HP · 670 HP, 4.0s / 3.0s, 310 · 325 km/h, Rear",
      fr: "460 CV · 670 CV, 4,0s / 3,0s, 310 · 325 km/h, Arrière",
      de: "460 PS · 670 PS, 4,0s / 3,0s, 310 · 325 km/h, Hinterrad",
      es: "460 CV · 670 CV, 4,0s / 3,0s, 310 · 325 km/h, Trasera"
    },
    "460 CV · 600 CV, 4.0s / 3.5s, 310 · 320 km/h, Posteriore": {
      en: "460 HP · 600 HP, 4.0s / 3.5s, 310 · 320 km/h, Rear",
      fr: "460 CV · 600 CV, 4,0s / 3,5s, 310 · 320 km/h, Arrière",
      de: "460 PS · 600 PS, 4,0s / 3,5s, 310 · 320 km/h, Hinterrad",
      es: "460 CV · 600 CV, 4,0s / 3,5s, 310 · 320 km/h, Trasera"
    },
    "460 CV · 640 CV, 4.0s / 3.1s, 310 · 325 km/h, Posteriore · Integrale": {
      en: "460 HP · 640 HP, 4.0s / 3.1s, 310 · 325 km/h, Rear · AWD",
      fr: "460 CV · 640 CV, 4,0s / 3,1s, 310 · 325 km/h, Arrière · Intégrale",
      de: "460 PS · 640 PS, 4,0s / 3,1s, 310 · 325 km/h, Hinterrad · Allrad",
      es: "460 CV · 640 CV, 4,0s / 3,1s, 310 · 325 km/h, Trasera · Integral"
    },
    "560 CV · 570 CV, 3.6s / 3.4s, 316 · 320 km/h, Posteriore": {
      en: "560 HP · 570 HP, 3.6s / 3.4s, 316 · 320 km/h, Rear",
      fr: "560 CV · 570 CV, 3,6s / 3,4s, 316 · 320 km/h, Arrière",
      de: "560 PS · 570 PS, 3,6s / 3,4s, 316 · 320 km/h, Hinterrad",
      es: "560 CV · 570 CV, 3,6s / 3,4s, 316 · 320 km/h, Trasera"
    },
    "560 CV · 670 CV, 3.6s / 3.0s, 316 · 325 km/h, Posteriore": {
      en: "560 HP · 670 HP, 3.6s / 3.0s, 316 · 325 km/h, Rear",
      fr: "560 CV · 670 CV, 3,6s / 3,0s, 316 · 325 km/h, Arrière",
      de: "560 PS · 670 PS, 3,6s / 3,0s, 316 · 325 km/h, Hinterrad",
      es: "560 CV · 670 CV, 3,6s / 3,0s, 316 · 325 km/h, Trasera"
    },
    "560 CV · 600 CV, 3.6s / 3.5s, 316 · 320 km/h, Posteriore": {
      en: "560 HP · 600 HP, 3.6s / 3.5s, 316 · 320 km/h, Rear",
      fr: "560 CV · 600 CV, 3,6s / 3,5s, 316 · 320 km/h, Arrière",
      de: "560 PS · 600 PS, 3,6s / 3,5s, 316 · 320 km/h, Hinterrad",
      es: "560 CV · 600 CV, 3,6s / 3,5s, 316 · 320 km/h, Trasera"
    },
    "560 CV · 640 CV, 3.6s / 3.1s, 316 · 325 km/h, Posteriore · Integrale": {
      en: "560 HP · 640 HP, 3.6s / 3.1s, 316 · 325 km/h, Rear · AWD",
      fr: "560 CV · 640 CV, 3,6s / 3,1s, 316 · 325 km/h, Arrière · Intégrale",
      de: "560 PS · 640 PS, 3,6s / 3,1s, 316 · 325 km/h, Hinterrad · Allrad",
      es: "560 CV · 640 CV, 3,6s / 3,1s, 316 · 325 km/h, Trasera · Integral"
    },
    "600 CV · 570 CV, 3.5s / 3.4s, 320 km/h, Posteriore": {
      en: "600 HP · 570 HP, 3.5s / 3.4s, 320 km/h, Rear",
      fr: "600 CV · 570 CV, 3,5s / 3,4s, 320 km/h, Arrière",
      de: "600 PS · 570 PS, 3,5s / 3,4s, 320 km/h, Hinterrad",
      es: "600 CV · 570 CV, 3,5s / 3,4s, 320 km/h, Trasera"
    },
    "600 CV · 670 CV, 3.5s / 3.0s, 320 · 325 km/h, Posteriore": {
      en: "600 HP · 670 HP, 3.5s / 3.0s, 320 · 325 km/h, Rear",
      fr: "600 CV · 670 CV, 3,5s / 3,0s, 320 · 325 km/h, Arrière",
      de: "600 PS · 670 PS, 3,5s / 3,0s, 320 · 325 km/h, Hinterrad",
      es: "600 CV · 670 CV, 3,5s / 3,0s, 320 · 325 km/h, Trasera"
    },
    "600 CV · 640 CV, 3.5s / 3.1s, 320 · 325 km/h, Posteriore · Integrale": {
      en: "600 HP · 640 HP, 3.5s / 3.1s, 320 · 325 km/h, Rear · AWD",
      fr: "600 CV · 640 CV, 3,5s / 3,1s, 320 · 325 km/h, Arrière · Intégrale",
      de: "600 PS · 640 PS, 3,5s / 3,1s, 320 · 325 km/h, Hinterrad · Allrad",
      es: "600 CV · 640 CV, 3,5s / 3,1s, 320 · 325 km/h, Trasera · Integral"
    },
    "570 CV · 670 CV, 3.4s / 3.0s, 320 · 325 km/h, Posteriore": {
      en: "570 HP · 670 HP, 3.4s / 3.0s, 320 · 325 km/h, Rear",
      fr: "570 CV · 670 CV, 3,4s / 3,0s, 320 · 325 km/h, Arrière",
      de: "570 PS · 670 PS, 3,4s / 3,0s, 320 · 325 km/h, Hinterrad",
      es: "570 CV · 670 CV, 3,4s / 3,0s, 320 · 325 km/h, Trasera"
    },
    "570 CV · 640 CV, 3.4s / 3.1s, 320 · 325 km/h, Posteriore · Integrale": {
      en: "570 HP · 640 HP, 3.4s / 3.1s, 320 · 325 km/h, Rear · AWD",
      fr: "570 CV · 640 CV, 3,4s / 3,1s, 320 · 325 km/h, Arrière · Intégrale",
      de: "570 PS · 640 PS, 3,4s / 3,1s, 320 · 325 km/h, Hinterrad · Allrad",
      es: "570 CV · 640 CV, 3,4s / 3,1s, 320 · 325 km/h, Trasera · Integral"
    },
    "670 CV · 640 CV, 3.0s / 3.1s, 325 km/h, Posteriore · Integrale": {
      en: "670 HP · 640 HP, 3.0s / 3.1s, 325 km/h, Rear · AWD",
      fr: "670 CV · 640 CV, 3,0s / 3,1s, 325 km/h, Arrière · Intégrale",
      de: "670 PS · 640 PS, 3,0s / 3,1s, 325 km/h, Hinterrad · Allrad",
      es: "670 CV · 640 CV, 3,0s / 3,1s, 325 km/h, Trasera · Integral"
    },
    "490 CV, 3.8s, 312 km/h, Posteriore": {
      en: "490 HP, 3.8s, 312 km/h, Rear",
      fr: "490 CV, 3,8s, 312 km/h, Arrière",
      de: "490 PS, 3,8s, 312 km/h, Hinterrad",
      es: "490 CV, 3,8s, 312 km/h, Trasera"
    },
    "600 CV, 3.5 s, >320 km/h, Posteriore": {
      en: "600 HP, 3.5 s, >320 km/h, Rear",
      fr: "600 CV, 3,5 s, >320 km/h, Arrière",
      de: "600 PS, 3,5 s, >320 km/h, Hinterrad",
      es: "600 CV, 3,5 s, >320 km/h, Trasera"
    },
    "670 CV, 3.0 s, >325 km/h, Posteriore": {
      en: "670 HP, 3.0 s, >325 km/h, Rear",
      fr: "670 CV, 3,0 s, >325 km/h, Arrière",
      de: "670 PS, 3,0 s, >325 km/h, Hinterrad",
      es: "670 CV, 3,0 s, >325 km/h, Trasera"
    },
    "570 CV, 3.4 s, >325 km/h, Posteriore": {
      en: "570 HP, 3.4 s, >325 km/h, Rear",
      fr: "570 CV, 3,4 s, >325 km/h, Arrière",
      de: "570 PS, 3,4 s, >325 km/h, Hinterrad",
      es: "570 CV, 3,4 s, >325 km/h, Trasera"
    },
    "560 CV, ~3.6 s, ~315 km/h, Posteriore": {
      en: "560 HP, ~3.6 s, ~315 km/h, Rear",
      fr: "560 CV, ~3,6 s, ~315 km/h, Arrière",
      de: "560 PS, ~3,6 s, ~315 km/h, Hinterrad",
      es: "560 CV, ~3,6 s, ~315 km/h, Trasera"
    },
    "610 CV, ~3.4 s, 325 km/h, Integrale": {
      en: "610 HP, ~3.4 s, 325 km/h, AWD",
      fr: "610 CV, ~3,4 s, 325 km/h, Intégrale",
      de: "610 PS, ~3,4 s, 325 km/h, Allrad",
      es: "610 CV, ~3,4 s, 325 km/h, Integral"
    },
    "570 CV, 3.4 s, 325 km/h, Posteriore": {
      en: "570 HP, 3.4 s, 325 km/h, Rear",
      fr: "570 CV, 3,4 s, 325 km/h, Arrière",
      de: "570 PS, 3,4 s, 325 km/h, Hinterrad",
      es: "570 CV, 3,4 s, 325 km/h, Trasera"
    },
    "720 CV, 2.9 s, 340 km/h, Posteriore": {
      en: "720 HP, 2.9 s, 340 km/h, Rear",
      fr: "720 CV, 2,9 s, 340 km/h, Arrière",
      de: "720 PS, 2,9 s, 340 km/h, Hinterrad",
      es: "720 CV, 2,9 s, 340 km/h, Trasera"
    },
    "830 CV, 2.9 s, 330 km/h, Posteriore": {
      en: "830 HP, 2.9 s, 330 km/h, Rear",
      fr: "830 CV, 2,9 s, 330 km/h, Arrière",
      de: "830 PS, 2,9 s, 330 km/h, Hinterrad",
      es: "830 CV, 2,9 s, 330 km/h, Trasera"
    },
    "620 CV, 3.4 s, >320 km/h, Posteriore": {
      en: "620 HP, 3.4 s, >320 km/h, Rear",
      fr: "620 CV, 3,4 s, >320 km/h, Arrière",
      de: "620 PS, 3,4 s, >320 km/h, Hinterrad",
      es: "620 CV, 3,4 s, >320 km/h, Trasera"
    },
    "630 CV, 2.8 s, 325 km/h, Posteriore": {
      en: "630 HP, 2.8 s, 325 km/h, Rear",
      fr: "630 CV, 2,8 s, 325 km/h, Arrière",
      de: "630 PS, 2,8 s, 325 km/h, Hinterrad",
      es: "630 CV, 2,8 s, 325 km/h, Trasera"
    },
    "720 CV, 2.9 s, 341 km/h, Posteriore": {
      en: "720 HP, 2.9 s, 341 km/h, Rear",
      fr: "720 CV, 2,9 s, 341 km/h, Arrière",
      de: "720 PS, 2,9 s, 341 km/h, Hinterrad",
      es: "720 CV, 2,9 s, 341 km/h, Trasera"
    }
  },
  
  // =============================================
  // CARATTERISTICHE (SPECS MECCANICHE)
  // =============================================
  
  caratteristiche: {
    "V8 aspirato, 4297 cc · 4497 cc, DCT 7-marce, 4 / 2": {
      en: "V8 naturally aspirated, 4297 cc · 4497 cc, 7-speed DCT, 4 / 2",
      fr: "V8 atmosphérique, 4297 cc · 4497 cc, DCT 7 rapports, 4 / 2",
      de: "V8 Saugmotor, 4297 cc · 4497 cc, 7-Gang DCT, 4 / 2",
      es: "V8 atmosférico, 4297 cc · 4497 cc, DCT 7 marchas, 4 / 2"
    },
    "V8 aspirato · V8 turbo, 4297 cc · 3855 cc, DCT 7-marce, 4": {
      en: "V8 naturally aspirated · V8 turbo, 4297 cc · 3855 cc, 7-speed DCT, 4",
      fr: "V8 atmosphérique · V8 turbo, 4297 cc · 3855 cc, DCT 7 rapports, 4",
      de: "V8 Saugmotor · V8 Turbo, 4297 cc · 3855 cc, 7-Gang DCT, 4",
      es: "V8 atmosférico · V8 turbo, 4297 cc · 3855 cc, DCT 7 marchas, 4"
    },
    "V8 aspirato · V8 turbo, 4297 cc · 3902 cc, DCT 7-marce, 4 / 2": {
      en: "V8 naturally aspirated · V8 turbo, 4297 cc · 3902 cc, 7-speed DCT, 4 / 2",
      fr: "V8 atmosphérique · V8 turbo, 4297 cc · 3902 cc, DCT 7 rapports, 4 / 2",
      de: "V8 Saugmotor · V8 Turbo, 4297 cc · 3902 cc, 7-Gang DCT, 4 / 2",
      es: "V8 atmosférico · V8 turbo, 4297 cc · 3902 cc, DCT 7 marchas, 4 / 2"
    },
    "V8 aspirato · V8 turbo, 4297 cc · 3855 cc, DCT 7-marce, 4": {
      en: "V8 naturally aspirated · V8 turbo, 4297 cc · 3855 cc, 7-speed DCT, 4",
      fr: "V8 atmosphérique · V8 turbo, 4297 cc · 3855 cc, DCT 7 rapports, 4",
      de: "V8 Saugmotor · V8 Turbo, 4297 cc · 3855 cc, 7-Gang DCT, 4",
      es: "V8 atmosférico · V8 turbo, 4297 cc · 3855 cc, DCT 7 marchas, 4"
    },
    "V8 aspirato · V10, 4297 cc · 5204 cc, DCT 7-marce, 4 / 2": {
      en: "V8 naturally aspirated · V10, 4297 cc · 5204 cc, 7-speed DCT, 4 / 2",
      fr: "V8 atmosphérique · V10, 4297 cc · 5204 cc, DCT 7 rapports, 4 / 2",
      de: "V8 Saugmotor · V10, 4297 cc · 5204 cc, 7-Gang DCT, 4 / 2",
      es: "V8 atmosférico · V10, 4297 cc · 5204 cc, DCT 7 marchas, 4 / 2"
    },
    "V8 turbo · V8 aspirato, 3855 cc · 4497 cc, DCT 7-marce, 4 / 2": {
      en: "V8 turbo · V8 naturally aspirated, 3855 cc · 4497 cc, 7-speed DCT, 4 / 2",
      fr: "V8 turbo · V8 atmosphérique, 3855 cc · 4497 cc, DCT 7 rapports, 4 / 2",
      de: "V8 Turbo · V8 Saugmotor, 3855 cc · 4497 cc, 7-Gang DCT, 4 / 2",
      es: "V8 turbo · V8 atmosférico, 3855 cc · 4497 cc, DCT 7 marchas, 4 / 2"
    },
    "V8 turbo, 3855 cc · 3902 cc, DCT 7-marce, 4 / 2": {
      en: "V8 turbo, 3855 cc · 3902 cc, 7-speed DCT, 4 / 2",
      fr: "V8 turbo, 3855 cc · 3902 cc, DCT 7 rapports, 4 / 2",
      de: "V8 Turbo, 3855 cc · 3902 cc, 7-Gang DCT, 4 / 2",
      es: "V8 turbo, 3855 cc · 3902 cc, DCT 7 marchas, 4 / 2"
    },
    "V8 turbo, 3855 cc, DCT 7-marce, 4": {
      en: "V8 turbo, 3855 cc, 7-speed DCT, 4",
      fr: "V8 turbo, 3855 cc, DCT 7 rapports, 4",
      de: "V8 Turbo, 3855 cc, 7-Gang DCT, 4",
      es: "V8 turbo, 3855 cc, DCT 7 marchas, 4"
    },
    "V8 turbo · V10, 3855 cc · 5204 cc, DCT 7-marce, 4 / 2": {
      en: "V8 turbo · V10, 3855 cc · 5204 cc, 7-speed DCT, 4 / 2",
      fr: "V8 turbo · V10, 3855 cc · 5204 cc, DCT 7 rapports, 4 / 2",
      de: "V8 Turbo · V10, 3855 cc · 5204 cc, 7-Gang DCT, 4 / 2",
      es: "V8 turbo · V10, 3855 cc · 5204 cc, DCT 7 marchas, 4 / 2"
    },
    "V8 turbo · V8 aspirato, 3855 cc · 4497 cc, DCT 7-marce, 4 / 2": {
      en: "V8 turbo · V8 naturally aspirated, 3855 cc · 4497 cc, 7-speed DCT, 4 / 2",
      fr: "V8 turbo · V8 atmosphérique, 3855 cc · 4497 cc, DCT 7 rapports, 4 / 2",
      de: "V8 Turbo · V8 Saugmotor, 3855 cc · 4497 cc, 7-Gang DCT, 4 / 2",
      es: "V8 turbo · V8 atmosférico, 3855 cc · 4497 cc, DCT 7 marchas, 4 / 2"
    },
    "V8 turbo, 3855 cc · 3902 cc, DCT 7-marce, 4 / 2": {
      en: "V8 turbo, 3855 cc · 3902 cc, 7-speed DCT, 4 / 2",
      fr: "V8 turbo, 3855 cc · 3902 cc, DCT 7 rapports, 4 / 2",
      de: "V8 Turbo, 3855 cc · 3902 cc, 7-Gang DCT, 4 / 2",
      es: "V8 turbo, 3855 cc · 3902 cc, DCT 7 marchas, 4 / 2"
    },
    "V8 turbo · V10, 3855 cc · 5204 cc, DCT 7-marce, 4 / 2": {
      en: "V8 turbo · V10, 3855 cc · 5204 cc, 7-speed DCT, 4 / 2",
      fr: "V8 turbo · V10, 3855 cc · 5204 cc, DCT 7 rapports, 4 / 2",
      de: "V8 Turbo · V10, 3855 cc · 5204 cc, 7-Gang DCT, 4 / 2",
      es: "V8 turbo · V10, 3855 cc · 5204 cc, DCT 7 marchas, 4 / 2"
    },
    "V8 aspirato · V8 turbo, 4497 cc · 3902 cc, DCT 7-marce, 2": {
      en: "V8 naturally aspirated · V8 turbo, 4497 cc · 3902 cc, 7-speed DCT, 2",
      fr: "V8 atmosphérique · V8 turbo, 4497 cc · 3902 cc, DCT 7 rapports, 2",
      de: "V8 Saugmotor · V8 Turbo, 4497 cc · 3902 cc, 7-Gang DCT, 2",
      es: "V8 atmosférico · V8 turbo, 4497 cc · 3902 cc, DCT 7 marchas, 2"
    },
    "V8 aspirato · V10, 4497 cc · 5204 cc, DCT 7-marce, 2": {
      en: "V8 naturally aspirated · V10, 4497 cc · 5204 cc, 7-speed DCT, 2",
      fr: "V8 atmosphérique · V10, 4497 cc · 5204 cc, DCT 7 rapports, 2",
      de: "V8 Saugmotor · V10, 4497 cc · 5204 cc, 7-Gang DCT, 2",
      es: "V8 atmosférico · V10, 4497 cc · 5204 cc, DCT 7 marchas, 2"
    },
    "V8 turbo · V10, 3902 cc · 5204 cc, DCT 7-marce, 2": {
      en: "V8 turbo · V10, 3902 cc · 5204 cc, 7-speed DCT, 2",
      fr: "V8 turbo · V10, 3902 cc · 5204 cc, DCT 7 rapports, 2",
      de: "V8 Turbo · V10, 3902 cc · 5204 cc, 7-Gang DCT, 2",
      es: "V8 turbo · V10, 3902 cc · 5204 cc, DCT 7 marchas, 2"
    },
    "V8 aspirato, 4297 cc, DCT 7-marce, 4": {
      en: "V8 naturally aspirated, 4297 cc, 7-speed DCT, 4",
      fr: "V8 atmosphérique, 4297 cc, DCT 7 rapports, 4",
      de: "V8 Saugmotor, 4297 cc, 7-Gang DCT, 4",
      es: "V8 atmosférico, 4297 cc, DCT 7 marchas, 4"
    },
    "V8 biturbo, 3855 cc, DCT 7‑marce, 4": {
      en: "V8 twin-turbo, 3855 cc, 7-speed DCT, 4",
      fr: "V8 biturbo, 3855 cc, DCT 7 rapports, 4",
      de: "V8 Biturbo, 3855 cc, 7-Gang DCT, 4",
      es: "V8 biturbo, 3855 cc, DCT 7 marchas, 4"
    },
    "V8 biturbo, 3902 cc, DCT 7‑marce, 2": {
      en: "V8 twin-turbo, 3902 cc, 7-speed DCT, 2",
      fr: "V8 biturbo, 3902 cc, DCT 7 rapports, 2",
      de: "V8 Biturbo, 3902 cc, 7-Gang DCT, 2",
      es: "V8 biturbo, 3902 cc, DCT 7 marchas, 2"
    },
    "V8 aspirato, 4497 cc, DCT 7‑marce, 2": {
      en: "V8 naturally aspirated, 4497 cc, 7-speed DCT, 2",
      fr: "V8 atmosphérique, 4497 cc, DCT 7 rapports, 2",
      de: "V8 Saugmotor, 4497 cc, 7-Gang DCT, 2",
      es: "V8 atmosférico, 4497 cc, DCT 7 marchas, 2"
    },
    "V8 biturbo, ~3855 cc, DCT 7‑marce, 4": {
      en: "V8 twin-turbo, ~3855 cc, 7-speed DCT, 4",
      fr: "V8 biturbo, ~3855 cc, DCT 7 rapports, 4",
      de: "V8 Biturbo, ~3855 cc, 7-Gang DCT, 4",
      es: "V8 biturbo, ~3855 cc, DCT 7 marchas, 4"
    },
    "V10 aspirato, 5204 cc, DCT 7‑marce, 2": {
      en: "V10 naturally aspirated, 5204 cc, 7-speed DCT, 2",
      fr: "V10 atmosphérique, 5204 cc, DCT 7 rapports, 2",
      de: "V10 Saugmotor, 5204 cc, 7-Gang DCT, 2",
      es: "V10 atmosférico, 5204 cc, DCT 7 marchas, 2"
    },
    "V8 aspirato, 4497 cc, DCT 7‑marce, 2": {
      en: "V8 naturally aspirated, 4497 cc, 7-speed DCT, 2",
      fr: "V8 atmosphérique, 4497 cc, DCT 7 rapports, 2",
      de: "V8 Saugmotor, 4497 cc, 7-Gang DCT, 2",
      es: "V8 atmosférico, 4497 cc, DCT 7 marchas, 2"
    },
    "V8 biturbo, 3902 cc, DCT 7‑marce, 2": {
      en: "V8 twin-turbo, 3902 cc, 7-speed DCT, 2",
      fr: "V8 biturbo, 3902 cc, DCT 7 rapports, 2",
      de: "V8 Biturbo, 3902 cc, 7-Gang DCT, 2",
      es: "V8 biturbo, 3902 cc, DCT 7 marchas, 2"
    },
    "V6 biturbo + elettrico, 2992 cc, DCT 8‑marce, 2": {
      en: "V6 twin-turbo + electric, 2992 cc, 8-speed DCT, 2",
      fr: "V6 biturbo + électrique, 2992 cc, DCT 8 rapports, 2",
      de: "V6 Biturbo + Elektro, 2992 cc, 8-Gang DCT, 2",
      es: "V6 biturbo + eléctrico, 2992 cc, DCT 8 marchas, 2"
    },
    "V8 biturbo, 3855 cc, DCT 8‑marce, 2": {
      en: "V8 twin-turbo, 3855 cc, 8-speed DCT, 2",
      fr: "V8 biturbo, 3855 cc, DCT 8 rapports, 2",
      de: "V8 Biturbo, 3855 cc, 8-Gang DCT, 2",
      es: "V8 biturbo, 3855 cc, DCT 8 marchas, 2"
    },
    "V6 biturbo, 2992 cc, DCT 8‑marce, 2": {
      en: "V6 twin-turbo, 2992 cc, 8-speed DCT, 2",
      fr: "V6 biturbo, 2992 cc, DCT 8 rapports, 2",
      de: "V6 Biturbo, 2992 cc, 8-Gang DCT, 2",
      es: "V6 biturbo, 2992 cc, DCT 8 marchas, 2"
    },
    "V8 biturbo, 3994 cc, DCT 7‑marce, 2": {
      en: "V8 twin-turbo, 3994 cc, 7-speed DCT, 2",
      fr: "V8 biturbo, 3994 cc, DCT 7 rapports, 2",
      de: "V8 Biturbo, 3994 cc, 7-Gang DCT, 2",
      es: "V8 biturbo, 3994 cc, DCT 7 marchas, 2"
    }
  },
  
  // =============================================
  // POLITICHE (POLICIES)
  // =============================================
  
  politiche: {
    "Cancellazione: Puoi inviare la richiesta di cancellazione fino a 10 giorni prima della data prevista. L'accettazione della cancellazione e il rimborso saranno confermati in base alle condizioni applicabili.\nCambio data: È possibile modificare la data della prenotazione fino a 48 ore prima, senza costi aggiuntivi, previa verifica della disponibilità.\nValidità prenotazione: Tutte le prenotazioni sono valide per 6 mesi dalla data di acquisto.\nRequisiti guida: È necessario avere almeno 19 anni e patente valida da almeno 12 mesi, non sospesa o ritirata. Patente internazionale accettata per chi non risiede in Italia.": {
      en: "Cancellation: You can submit a cancellation request up to 10 days before the scheduled date. Cancellation acceptance and refund will be confirmed based on applicable conditions.\nDate Change: It is possible to change the booking date up to 48 hours before, at no additional cost, subject to availability verification.\nBooking Validity: All bookings are valid for 6 months from the purchase date.\nDriving Requirements: Must be at least 19 years old and have a valid license for at least 12 months, not suspended or withdrawn. International license accepted for non-residents in Italy.",
      fr: "Annulation : Vous pouvez soumettre une demande d'annulation jusqu'à 10 jours avant la date prévue. L'acceptation de l'annulation et le remboursement seront confirmés en fonction des conditions applicables.\nChangement de date : Il est possible de modifier la date de réservation jusqu'à 48 heures avant, sans frais supplémentaires, sous réserve de vérification de disponibilité.\nValidité de la réservation : Toutes les réservations sont valables 6 mois à compter de la date d'achat.\nExigences de conduite : Doit avoir au moins 19 ans et un permis valide depuis au moins 12 mois, non suspendu ou retiré. Permis international accepté pour les non-résidents en Italie.",
      de: "Stornierung: Sie können eine Stornierungsanfrage bis zu 10 Tage vor dem geplanten Datum einreichen. Die Annahme der Stornierung und die Rückerstattung werden basierend auf den geltenden Bedingungen bestätigt.\nDatumsänderung: Es ist möglich, das Buchungsdatum bis zu 48 Stunden vorher ohne zusätzliche Kosten zu ändern, vorbehaltlich der Verfügbarkeitsprüfung.\nBuchungsgültigkeit: Alle Buchungen sind 6 Monate ab Kaufdatum gültig.\nFahranforderungen: Muss mindestens 19 Jahre alt sein und einen gültigen Führerschein seit mindestens 12 Monaten haben, nicht ausgesetzt oder entzogen. Internationaler Führerschein wird für Nicht-Einwohner Italiens akzeptiert.",
      es: "Cancelación: Puede enviar una solicitud de cancelación hasta 10 días antes de la fecha prevista. La aceptación de la cancelación y el reembolso se confirmarán según las condiciones aplicables.\nCambio de fecha: Es posible cambiar la fecha de reserva hasta 48 horas antes, sin costos adicionales, sujeto a verificación de disponibilidad.\nValidez de la reserva: Todas las reservas son válidas por 6 meses desde la fecha de compra.\nRequisitos de conducción: Debe tener al menos 19 años y licencia válida por al menos 12 meses, no suspendida o retirada. Licencia internacional aceptada para no residentes en Italia."
    }
  }
};

/**
 * Funzione helper per recuperare traduzione
 * @param {string} category - Categoria (benefit, descrizione, prestazioni, caratteristiche, politiche)
 * @param {string} italianText - Testo italiano da tradurre
 * @param {string} targetLang - Lingua target (en, fr, de, es)
 * @returns {string} - Testo tradotto o originale se non trovato
 */
function getProductTranslation(category, italianText, targetLang) {
  if (!italianText || !targetLang || targetLang === 'it') {
    return italianText;
  }
  
  // Normalizza il testo italiano (rimuovi spazi extra, newline multipli)
  const normalizedText = italianText.trim().replace(/\s+/g, ' ');
  
  // Cerca nelle traduzioni della categoria
  const categoryTranslations = productTranslations[category];
  if (!categoryTranslations) {
    console.warn(`⚠️ Categoria '${category}' non trovata nelle traduzioni`);
    return italianText;
  }
  
  // Cerca traduzione esatta
  for (const [key, translations] of Object.entries(categoryTranslations)) {
    const normalizedKey = key.trim().replace(/\s+/g, ' ');
    if (normalizedKey === normalizedText) {
      return translations[targetLang] || italianText;
    }
  }
  
  // Se non trovato, prova ricerca case-insensitive
  const lowerText = normalizedText.toLowerCase();
  for (const [key, translations] of Object.entries(categoryTranslations)) {
    const normalizedKey = key.trim().replace(/\s+/g, ' ');
    if (normalizedKey.toLowerCase() === lowerText) {
      return translations[targetLang] || italianText;
    }
  }
  
  console.warn(`⚠️ Traduzione non trovata per: "${italianText.substring(0, 50)}..." in categoria '${category}'`);
  return italianText;
}

// Esporta per uso globale
if (typeof window !== 'undefined') {
  window.productTranslations = productTranslations;
  window.getProductTranslation = getProductTranslation;
}
