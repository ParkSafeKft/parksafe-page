export type Language = 'hu' | 'en';

export type TranslationKey = string;

export const translations = {
    hu: {
        nav: {
            home: 'Kezdőlap',
            contact: 'Kapcsolat',
            login: 'Bejelentkezés',
            profile: 'Profil',
            logout: 'Kijelentkezés',
        },
        footer: {
            rights: '© 2026 ParkSafe. Minden jog fenntartva.',
            appStore: 'App Store',
            googlePlay: 'Google Play',
            terms: 'ÁSZF',
            privacy: 'Adatvédelem',
        },
        home: {
            hero: {
                title: "ParkSafe: Városi Kerékpározás,",
                subtitle: "Újragondolva.",
                description: "Nem csak egy térkép. A ParkSafe a városi mikromobilitás operációs rendszere. Biztonságos parkolás, intelligens útvonaltervezés és közösségi erő egyetlen applikációban.",
                downloadIOS: "Letöltés iOS-re",
                downloadAndroid: "Irány az Android",
            },
            grid: {
                mainTitle: "Magyarország Legnagyobb Kerékpáros Hálózata",
                mainStat: "7,500+",
                mainStatLabel: "Ellenőrzött Parkolóhely",
                mainDesc: "Adatvezérelt parkolási megoldások. Valós idejű foglaltság, biztonsági besorolás és közösségi validáció minden egyes ponton.",
                infraTitle: "Biztonság-Első Tervezés",
                infraDesc: "Algoritmusunk a védett sávokat és a biztonságos zónákat részesíti előnyben, nem a legrövidebb, hanem a legbiztonságosabb utat keresve.",
                serviceTitle: "800+ Szervizpont",
                serviceDesc: "Azonnali segítség, bárhol is vagy. Szervizek, nyilvános pumpák és segélypontok térképe.",
                trafficTitle: "Élő Városi Adatok",
                trafficDesc: "Dinamikus útvonaltervezés a város pulzusához igazodva.",
                communityTitle: "Közösségi Validáció",
                communityStat: "98%",
                communityDesc: "Pontosság a felhasználói visszajelzések és a helyi közösség folyamatos jelentései alapján. Együtt építjük a legmegbízhatóbb térképet.",
                osTitle: "A jövő városi közlekedése.",
                osDesc: "Egyetlen platform, amely összeköti a kerékpárosokat a várossal. Adatvezérelt döntések a biztonságosabb holnapért.",
            },
            cta: {
                title: "Készen állsz a",
                titleHighlight: "jövőre?",
                desc: "Csatlakozz a ParkSafe közösséghez, és légy része a városi közlekedés forradalmának. Töltsd le még ma.",
                security: "v2.4 Kiadás • Nagyvállalati Szintű Biztonság • GDPR Megfelelő",
            },
            impact: {
                badge: "Élő közösségi hatás",
                title: "Együtt mentettünk",
                titleHighlight: "CO₂-t a városoknak.",
                description: "Minden kerékpáros út valós megtakarítás. Ezek az adatok a ParkSafe közösség által rögzített útvonalakból származnak, és naponta frissülnek.",
                heroLabel: "Eddigi össz CO₂ megtakarítás",
                heroSubtitle: "Annyi szén-dioxid, amit nem engedtünk a város levegőjébe — autós utak helyett kerékpárral.",
                last30Days: "Utolsó 30 nap",
                totalRides: "Rögzített utak",
                kmLabel: "Megtett kilométer",
                carTripsLabel: "Kiváltott autós út",
                treesLabel: "Évnyi fa CO₂-megkötése",
                methodology: "Számítás: 90 g CO₂ / km megtakarítás (150 g/km városi autókibocsátás × ~60% modal shift), 5 km átlagos autós úthossz, 21 kg CO₂ / év érett fa megkötése alapján.",
                updatedOn: "frissítve",
            }
        },
        howItWorks: {
            title: "Hogyan működik?",
            subtitle: "Intelligens megoldás, egyszerű lépésekben.",
            step1: {
                title: "Töltsd le és Indítsd",
                desc: "Elérhető iOS és Android platformokon. Regisztrálj másodpercek alatt."
            },
            step2: {
                title: "Keress Tárolóhelyet",
                desc: "A térképen egyszerűen megtalálhatod a közeledben lévő kerékpártárolókat."
            },
            step3: {
                title: "Válassz Úti Célt",
                desc: "Nézd meg a tároló adatait, majd válaszd ki a számodra megfelelő helyet."
            },
            step4: {
                title: "Parkolj Biztonságban",
                desc: "Navigálj a kiválasztott helyre és parkolj nyugodtan."
            }
        },
        faq: {
            title: "Gyakran Ismételt Kérdések",
            subtitle: "Minden, amit a ParkSafe használatáról tudni érdemes.",
            q1: "Mi az a ParkSafe?",
            a1: "A ParkSafe egy kifejezetten kerékpárosokra optimalizált digitális térképalkalmazás, amely egyesíti az útvonaltervezést, tárolóhelyeket és szervizeket egyetlen platformon. Közép-Európában több országban is elérhető.",
            q2: "Hogyan működik az útvonaltervezés?",
            a2: "A ParkSafe nem autós, hanem kerékpáros logikára építő útvonalakat ajánl. Figyelembe veszi a kerékpárutak minőségét, biztonságát és a városi közlekedés sajátosságait – nem túrázásra, hanem munkahelyre, egyetemre vagy ügyintézésre való eljutáshoz.",
            q3: "Milyen információkat tartalmaz egy tároló adatlapja?",
            a3: "Minden tárolónál megtalálod: fedett vagy nyitott tárolás, biztonsági szint (van-e kamerás védelem), közösségi értékelések, felhasználói képek és tapasztalatok. Így megalapozott döntést hozhatsz.",
            q4: "Ingyenes a ParkSafe használata?",
            a4: "Igen, a ParkSafe alapfunkciói teljesen ingyenesen használhatók. Jelenleg nincs díjköteles szolgáltatás, a jövőben esetlegesen partneri kedvezmények jelenhetnek meg.",
            q5: "Mennyire megbízhatóak az adatok?",
            a5: "A ParkSafe közösségi alapon működik: felhasználók osztják meg tapasztalataikat, értékelik a helyeket és töltenek fel képeket. Ez biztosítja, hogy az információk naprakészek és valósak legyenek.",
            q6: "Hol érhető el a ParkSafe?",
            a6: "A ParkSafe közép-európai jelenléttel rendelkezik: több országban érhető el teljes funkcionalitással. A hálózat folyamatosan bővül, új városok és régiók csatlakoznak.",
            q7: "Hogyan vehetem fel a kapcsolatot a csapattal?",
            a7: 'A weboldalon található "Írj nekünk" menüponton keresztül tudsz üzenetet küldeni. Minden megkeresésre igyekszünk gyorsan reagálni.',
        },
        partners: {
            title: "Partnerek és Előnyök",
            subtitle: "Mert a közösség ereje kifizetődő.",
            comingSoon: "Hamarosan érkezik!",
            partnerInvite: "Kerékpáros márkát, üzletet vagy szervizt képviselsz?",
            partnerHeading: "Építsük együtt a ParkSafe partnerhálózatát.",
            partnerCta: "Partnerként kapcsolatba lépek",
            benefit1: {
                title: "Exkluzív Kedvezmények",
                desc: "Prémium ajánlatok a legnagyobb kerékpáros márkáktól és boltoktól."
            },
            benefit2: {
                title: "Kiemelt Szervizháttér",
                desc: "Soron kívüli foglalás és kedvezményes javítás partnereinknél."
            },
            benefit3: {
                title: "Életmód és Közösség",
                desc: "Belépők, események és közösségi programok csak ParkSafe tagoknak."
            }
        },
        contact: {
            title: "Kapcsolat",
            subtitle: "Innovációs partnerünk vagy felhasználónk? Hallani akarunk felőled.",
            role: "Üzletvezető & Kapcsolattartó",
            responseTimeTitle: "Válaszidő",
            responseTimeDesc: "Üzleti megkeresésekre 24 órán belül reagálunk.",
            footerNote: "Kérdésed van az applikációval, adatokkal kapcsolatban, vagy szeretnél együttműködni velünk? Írj bátran emailben vagy hívj telefonon!",
        },
        login: {
            title: "Bejelentkezés",
            subtitle: "Lépj be a ParkSafe fiókodba",
            emailLabel: "Email cím",
            passwordLabel: "Jelszó",
            nextButton: "Tovább",
            loginButton: "Bejelentkezés",
            googleButton: "Google-lal folytatás",
            changeEmail: "Módosítás",
            backToHome: "Vissza a főoldalra",
            checking: "Ellenőrzés…",
            errorGeneric: "Hiba történt. Kérjük, próbálja újra.",
            errorNoAccount: "Nincs regisztrált fiók ezzel az email címmel.",
        },
        forgotPassword: {
            title: "Elfelejtett jelszó",
            subtitle: "Add meg az email címedet, és küldünk egy linket a jelszó visszaállításához.",
            emailLabel: "Email cím",
            submitButton: "Visszaállító link küldése",
            backToLogin: "Vissza a bejelentkezéshez",
            successMessage: "Ha létezik fiók ezzel az email címmel, küldtünk egy visszaállító linket.",
            errorGeneric: "Hiba történt. Kérjük, próbálja újra.",
        },
        resetPassword: {
            title: "Új jelszó beállítása",
            subtitle: "Kérjük, add meg az új jelszavadat.",
            passwordLabel: "Új jelszó",
            confirmPasswordLabel: "Jelszó megerősítése",
            submitButton: "Jelszó mentése",
            successMessage: "A jelszó sikeresen frissítve. Átirányítás a bejelentkezéshez...",
            errorGeneric: "Hiba történt a jelszó frissítése közben.",
            errorMismatch: "A jelszavak nem egyeznek.",
            errorLength: "A jelszónak legalább 8 karakter hosszúnak kell lennie.",
            errorInvalidLink: "A visszaállító link hiányzik vagy lejárt. Kérj egy új linket.",
            verifying: "A visszaállító link ellenőrzése…",
        },
        profile: {
            greeting: "Szia",
            subtitle: "Kezeld a fiókod beállításait és a ParkSafe tevékenységeidet.",
            accountInfo: "Fiók Információk",
            fullName: "Teljes Név",
            email: "Email Cím",
            loginMethod: "Bejelentkezés",
            registration: "Regisztráció",
            lastLogin: "Legutóbbi Belépés",
            actions: "Műveletek",
            adminPanel: "Admin Panel",
            logout: "Kijelentkezés",
            dangerZone: "Veszélyes Zóna",
            deleteAccount: "Fiók Törlése",
            deleteDesc: "A fiók törlése végleges és nem vonható vissza. Minden adatod törlésre kerül.",
            deleteModalTitle: "Fiók Törlése",
            deleteModalWarning: "Figyelem! Ez a művelet nem visszavonható.",
            deleteModalConfirm: "Biztosan folytatni szeretnéd? Kérjük erősítsd meg szándékod.",
            cancel: "Mégsem",
            verify: "Igen, törlöm",
            deleting: "Törlés…",
            sendResetLink: "Jelszó Visszaállítása",
            resetLinkDescription: "Küldünk egy jelszó-visszaállító linket az email címedre. Kattints a linkre a jelszavad megváltoztatásához.",
            resetLinkSent: "A jelszó-visszaállító link elküldve az email címedre!",
            deleteProfileData: "Profilinformációk végleges törlése",
            deleteLoginData: "Bejelentkezési adatok eltávolítása",
            deleteSettings: "Elmentett beállítások elvesztése",
        },
        about: {
            nav: "Rólunk",
            highlight: {
                title: "Kitartás és Elismerés",
                subtitle: "Egy startup útja a kezdetektől a nemzeti elismerésig.",
                cta: "Teljes Történet",
                card1: {
                    badge: "Nemzeti Program",
                    title: "Top 10 Országosan",
                    desc: "Bekerültünk a Magyar Nemzeti Tehetség Program tíz legjobb startupkezdeményezése közé."
                },
                card2: {
                    badge: "Egyetemi Elismerés",
                    title: "Top 14 a 144-ből",
                    desc: "A Szegedi Tudományegyetem innovációs programjában kiemelkedő helyezést értünk el."
                },
                card3: {
                    badge: "Folyamatos Növekedés",
                    title: "B2B/B2G Platform",
                    desc: "Az egyéni alkalmazástól a skálázható vállalati megoldásokig fejlődtünk."
                }
            },
            page: {
                title: "Rólunk",
                subtitle: "A ParkSafe története: az első szegedi térképtől a San Franciscó-i világdöntőig.",
                timeline: {
                    title: "Utunk",
                    subtitle: "Egy kerékpáros ötlet útja Szegedtől a nemzetközi színpadig.",
                    milestone1: {
                        year: "2025 Eleje",
                        badge: "Alapítás",
                        title: "Egy Probléma, Egy Megoldás",
                        desc: "A ParkSafe projektet azért hoztuk létre, hogy válaszoljunk egy hiányosságra: nem létezett olyan eszköz, amely segítette volna a kerékpárosokat biztonságos és megbízható parkolóhelyek megtalálásában a városi környezetben.",
                        imageAlt: "ParkSafe alapítási pillanat"
                    },
                    milestone2: {
                        year: "2025 Vége",
                        badge: "Első Verzió",
                        title: "Mobil Applikáció Indítása",
                        desc: "Elindítottuk az első mobilalkalmazást interaktív térképpel, amely lehetővé tette a felhasználók számára, hogy megtalálják és értékeljék a kerékpár-tárolóhelyeket Szegeden.",
                        imageAlt: "Első mobil app bemutató"
                    },
                    milestone3: {
                        year: "2025–2026",
                        badge: "Nemzeti Elismerés",
                        title: "Top 10 és ECC Dobogó",
                        desc: "A Nemzeti Tehetség Programban az ország tíz legjobb startupkezdeményezése közé kerültünk, majd az Entrepreneurship Club of Corvinus versenyén harmadik helyezést értünk el.",
                        achievement: "🏆 Nemzeti Tehetség Program • Top 10 · ECC • 3. hely",
                        imageAlt: "Nemzeti Tehetség Program díj"
                    },
                    milestone4: {
                        year: "2026 Eleje",
                        badge: "Egyetemi Siker",
                        title: "Egyetemi és Régiós Elismerés",
                        desc: "A Szegedi Tudományegyetem innovációs programjában 144 pályázó közül a legjobb 14 közé, a magyar, cseh, lengyel és szlovák startupokat összekötő V4 Startup versenyen pedig a legjobb négy közé kerültünk.",
                        achievement: "🏆 Szegedi Tudományegyetem • Top 14 / 144 · V4 Startup • Top 4",
                        imageAlt: "Egyetemi elismerés ceremónia"
                    },
                    milestone5: {
                        year: "2026. Május",
                        badge: "Országos Győzelem",
                        title: "Red Bull Basement Magyar Győztes",
                        desc: "Az 1260 beküldött ötlet közül bejutottunk a tízcsapatos magyar döntőbe Debrecenben. Két percünk volt bemutatni a ParkSafe-et, a zsűri pedig minket választott Magyarország győztesének.",
                        achievement: "🏆 Red Bull Basement 2026 • Magyar győztes",
                        imageAlt: "A ParkSafe csapata a Red Bull Basement magyar döntőjén"
                    },
                    milestone6: {
                        year: "2026. Június",
                        badge: "Világdöntő",
                        title: "Magyarország Képviselete San Franciscóban",
                        desc: "A 14 órás út végén a világ 48 országának legjobb csapatai között mutattuk be a ParkSafe-et. A háromnapos program workshopjain az AMD, a Microsoft és a Plug and Play Ventures szakembereitől kaptunk közvetlen visszajelzést. Ezek a beszélgetések megerősítettek bennünket abban, hogy a ParkSafe által megoldott probléma más városokban is valós, és konkrét irányokat adtak a folytatáshoz.",
                        achievement: "🏆 Red Bull Basement World Final • San Francisco",
                        imageAlt: "A ParkSafe csapata az alkalmazást mutatja be a San Franciscó-i világdöntőn"
                    },
                    milestone7: {
                        year: "2026. Nyár – Ma",
                        badge: "Következő Fejezet",
                        title: "A Világdöntőtől az Új Funkciókig",
                        desc: "San Francisco megmutatta, hogy városonként más jelenti a jó kerékpáros útvonalat: Európában a biztonság, a dombos városokban az emelkedők elkerülése is kulcsfontosságú. Ezekből a visszajelzésekből építjük a következő nagy frissítést: kevésbé megterhelő útvonalak, közösségi kihívások, valamint sportos és turisztikai Balaton-kör helyi látnivalókkal. A ParkSafe közössége mára több mint 2000 regisztrált felhasználóra és 4000 letöltésre nőtt, az alkalmazás pedig már egész Európában elérhető.",
                        imageAlt: "A ParkSafe csapata a Red Bull Basement világdöntő helyszínén"
                    }
                },
                cta: {
                    title: "Csatlakozz Hozzánk",
                    desc: "Inspirálta a történetünk? Legyél része a városi mobilitás jövőjének. Vedd fel velünk a kapcsolatot!",
                    button: "Kapcsolat Felvétele"
                }
            }
        }
    },
    en: {
        nav: {
            home: 'Home',
            contact: 'Contact',
            login: 'Login',
            profile: 'Profile',
            logout: 'Logout',
        },
        footer: {
            rights: '© 2026 ParkSafe. All rights reserved.',
            appStore: 'App Store',
            googlePlay: 'Google Play',
            terms: 'Terms',
            privacy: 'Privacy',
        },
        home: {
            hero: {
                title: "Urban Cycling,",
                subtitle: "Reimagined.",
                description: "Not just a map. ParkSafe is the operating system for urban micro-mobility. Secure parking, intelligent routing, and community power in one app.",
                downloadIOS: "Download for iOS",
                downloadAndroid: "Get it on Android",
            },
            grid: {
                mainTitle: "Hungary's Largest Cycle Network",
                mainStat: "7,500+",
                mainStatLabel: "Verified Parking Spots",
                mainDesc: "Data-driven parking solutions. Real-time availability, security ratings, and community validation at every single point.",
                infraTitle: "Safety-First Design",
                infraDesc: "Our algorithm prioritizes protected lanes and safe zones, seeking not just the fastest, but the safest route.",
                serviceTitle: "800+ Service Points",
                serviceDesc: "Immediate help, wherever you are. Map of repair shops, public pumps, and emergency stations.",
                trafficTitle: "Live Urban Data",
                trafficDesc: "Dynamic routing adapted to the city's pulse.",
                communityTitle: "Community Verified",
                communityStat: "98%",
                communityDesc: "Accuracy rate driven by user feedback and continuous local community reports. Building the most reliable map together.",
                osTitle: "The Future of Urban Transit.",
                osDesc: "One platform connecting cyclists with their city. Data-driven decisions for a safer tomorrow.",
            },
            cta: {
                title: "Ready for the",
                titleHighlight: "future?",
                desc: "Join the ParkSafe community and be part of the urban transport revolution. Download today.",
                security: "v2.4 Release • Enterprise Grade Security • GDPR Compliant",
            },
            impact: {
                badge: "Live community impact",
                title: "Together we've saved",
                titleHighlight: "CO₂ for our cities.",
                description: "Every ride is a real saving. These figures are aggregated from rides logged by the ParkSafe community and refreshed daily.",
                heroLabel: "Total CO₂ saved to date",
                heroSubtitle: "Carbon dioxide we kept out of the city air — by choosing the bike over the car.",
                last30Days: "Last 30 days",
                totalRides: "Logged rides",
                kmLabel: "Kilometres ridden",
                carTripsLabel: "Car trips replaced",
                treesLabel: "Tree-years of CO₂ absorption",
                methodology: "Calculation: 90 g CO₂ / km saved (150 g/km urban car emissions × ~60% modal shift), 5 km mean car-trip length, 21 kg CO₂ / year absorbed by a mature tree.",
                updatedOn: "updated",
            }
        },
        howItWorks: {
            title: "How It Works",
            subtitle: "Smart solution, simple steps.",
            step1: {
                title: "Download & Launch",
                desc: "Available on iOS and Android. Register in seconds."
            },
            step2: {
                title: "Find a Parking Spot",
                desc: "Use the map to find bicycle parking near you."
            },
            step3: {
                title: "Choose Your Destination",
                desc: "Check the parking details and choose the place that suits you."
            },
            step4: {
                title: "Park Safely",
                desc: "Navigate to your spot and park with peace of mind."
            }
        },
        faq: {
            title: "Frequently Asked Questions",
            subtitle: "Everything you need to know about using ParkSafe.",
            q1: "What is ParkSafe?",
            a1: "ParkSafe is a digital map application optimized specifically for cyclists, combining route planning, parking spots, and service stations in one platform. It is available in several countries across Central Europe.",
            q2: "How does route planning work?",
            a2: "ParkSafe recommends routes based on cycling logic, not car logic. It considers bike path quality, safety, and urban traffic characteristics – designed for commuting to work, university, or errands, not just touring.",
            q3: "What information is on a parking spot's data sheet?",
            a3: "For every spot, you'll find: covered or open storage, security level (CCTV presence), community ratings, user photos, and experiences. This helps you make an informed decision.",
            q4: "Is ParkSafe free to use?",
            a4: "Yes, ParkSafe's core features are completely free to use. There are currently no paid services; partner discounts may appear in the future.",
            q5: "How reliable is the data?",
            a5: "ParkSafe operates on a community basis: users share their experiences, rate places, and upload photos. This ensures that information is up-to-date and real.",
            q6: "Where is ParkSafe available?",
            a6: "ParkSafe operates in Central Europe with full functionality in multiple countries. We are continuously expanding coverage to more cities and regions.",
            q7: "How can I contact the team?",
            a7: "You can send a message via the 'Contact Us' menu item on the website. We try to respond to all inquiries quickly.",
        },
        partners: {
            title: "Partners & Benefits",
            subtitle: "Because community power pays off.",
            comingSoon: "Coming Soon!",
            partnerInvite: "Representing a cycling brand, shop, or service center?",
            partnerHeading: "Let’s build the ParkSafe partner network together.",
            partnerCta: "Contact Us as a Partner",
            benefit1: {
                title: "Exclusive Discounts",
                desc: "Premium offers from top cycling brands and shops."
            },
            benefit2: {
                title: "Priority Service",
                desc: "Skip the line booking and discounted repairs at our partners."
            },
            benefit3: {
                title: "Lifestyle & Community",
                desc: "Tickets, events, and community programs only for ParkSafe members."
            }
        },
        contact: {
            title: "Contact",
            subtitle: "Innovation partner or user? We want to hear from you.",
            role: "Business Manager & Contact",
            responseTimeTitle: "Response Time",
            responseTimeDesc: "We respond to business inquiries within 24 hours.",
            footerNote: "Have questions about the app, data, or want to collaborate with us? Feel free to email or call!",
        },
        login: {
            title: "Login",
            subtitle: "Log in to your ParkSafe account",
            emailLabel: "Email address",
            passwordLabel: "Password",
            nextButton: "Next",
            loginButton: "Login",
            googleButton: "Continue with Google",
            changeEmail: "Change",
            backToHome: "Back to Home",
            checking: "Checking…",
            errorGeneric: "An error occurred. Please try again.",
            errorNoAccount: "No account found with this email address.",
        },
        forgotPassword: {
            title: "Forgot Password",
            subtitle: "Enter your email address and we'll send you a link to reset your password.",
            emailLabel: "Email address",
            submitButton: "Send Reset Link",
            backToLogin: "Back to Login",
            successMessage: "If an account exists with this email, we have sent a reset link.",
            errorGeneric: "An error occurred. Please try again.",
        },
        resetPassword: {
            title: "Reset Password",
            subtitle: "Please enter your new password.",
            passwordLabel: "New password",
            confirmPasswordLabel: "Confirm password",
            submitButton: "Save Password",
            successMessage: "Password updated successfully. Redirecting to login...",
            errorGeneric: "An error occurred while updating the password.",
            errorMismatch: "Passwords do not match.",
            errorLength: "Password must be at least 8 characters long.",
            errorInvalidLink: "The reset link is missing or has expired. Request a new link.",
            verifying: "Checking the reset link…",
        },
        profile: {
            greeting: "Hi",
            subtitle: "Manage your account settings and ParkSafe activity.",
            accountInfo: "Account Information",
            fullName: "Full Name",
            email: "Email Address",
            loginMethod: "Login Method",
            registration: "Registration",
            lastLogin: "Last Login",
            actions: "Actions",
            adminPanel: "Admin Panel",
            logout: "Logout",
            dangerZone: "Danger Zone",
            deleteAccount: "Delete Account",
            deleteDesc: "Deleting your account is permanent and cannot be undone. All your data will be permanently deleted.",
            deleteModalTitle: "Delete Account",
            deleteModalWarning: "Warning! This action cannot be undone.",
            deleteModalConfirm: "Are you sure you want to continue? Please confirm your intention.",
            cancel: "Cancel",
            verify: "Yes, delete it",
            deleting: "Deleting…",
            sendResetLink: "Reset Password",
            resetLinkDescription: "We'll send a password reset link to your email address. Click the link to change your password.",
            resetLinkSent: "Password reset link has been sent to your email!",
            deleteProfileData: "Permanently delete profile information",
            deleteLoginData: "Remove login credentials",
            deleteSettings: "Lose saved settings",
        },
        about: {
            nav: "About Us",
            highlight: {
                title: "Persistence and Recognition",
                subtitle: "A startup's journey from inception to national acclaim.",
                cta: "Full Story",
                card1: {
                    badge: "National Program",
                    title: "Top 10 Nationally",
                    desc: "Selected among the ten leading startup initiatives in Hungary's National Talent Program."
                },
                card2: {
                    badge: "University Recognition",
                    title: "Top 14 of 144",
                    desc: "Achieved outstanding placement in the University of Szeged's innovation program."
                },
                card3: {
                    badge: "Continuous Growth",
                    title: "B2B/B2G Platform",
                    desc: "Evolved from individual application to scalable enterprise solutions."
                }
            },
            page: {
                title: "About Us",
                subtitle: "The ParkSafe story: from our first map in Szeged to the world final in San Francisco.",
                timeline: {
                    title: "Our Journey",
                    subtitle: "A cycling idea's journey from Szeged to the international stage.",
                    milestone1: {
                        year: "Early 2025",
                        badge: "Foundation",
                        title: "One Problem, One Solution",
                        desc: "We created the ParkSafe project to address a gap: there was no tool to help cyclists find safe and reliable parking spots in urban environments.",
                        imageAlt: "ParkSafe founding moment"
                    },
                    milestone2: {
                        year: "End of 2025",
                        badge: "First Version",
                        title: "Mobile Application Launch",
                        desc: "We launched the first mobile application with an interactive map, enabling users to find and rate bicycle parking spots in Szeged.",
                        imageAlt: "First mobile app presentation"
                    },
                    milestone3: {
                        year: "2025–2026",
                        badge: "National Recognition",
                        title: "National Top 10 and an ECC Podium",
                        desc: "We were selected among the ten leading startup initiatives in Hungary's National Talent Program, then placed third in the Entrepreneurship Club of Corvinus competition.",
                        achievement: "🏆 National Talent Program • Top 10 · ECC • 3rd place",
                        imageAlt: "National Talent Program award"
                    },
                    milestone4: {
                        year: "Early 2026",
                        badge: "University Success",
                        title: "University and Regional Recognition",
                        desc: "We reached the top 14 from 144 applicants in the University of Szeged's innovation program, then finished among the top four in the V4 Startup competition for Hungarian, Czech, Polish, and Slovak teams.",
                        achievement: "🏆 University of Szeged • Top 14 / 144 · V4 Startup • Top 4",
                        imageAlt: "University recognition ceremony"
                    },
                    milestone5: {
                        year: "May 2026",
                        badge: "National Winner",
                        title: "Red Bull Basement Hungary Winner",
                        desc: "From 1,260 submitted ideas, we reached the ten-team Hungarian final in Debrecen. We had two minutes to present ParkSafe, and the jury selected us as Hungary's winner.",
                        achievement: "🏆 Red Bull Basement 2026 • Hungary winner",
                        imageAlt: "The ParkSafe team at the Red Bull Basement Hungarian final"
                    },
                    milestone6: {
                        year: "June 2026",
                        badge: "World Final",
                        title: "Representing Hungary in San Francisco",
                        desc: "After a 14-hour journey, we presented ParkSafe alongside the best teams from 48 countries. During the three-day program, we received direct feedback from experts at AMD, Microsoft and Plug and Play Ventures. Those conversations confirmed that the problem ParkSafe solves is real in cities far beyond our own and gave us concrete directions for what to build next.",
                        achievement: "🏆 Red Bull Basement World Final • San Francisco",
                        imageAlt: "The ParkSafe team presenting the app at the World Final in San Francisco"
                    },
                    milestone7: {
                        year: "Summer 2026 – Today",
                        badge: "Next Chapter",
                        title: "From the World Final to New Features",
                        desc: "San Francisco showed us that a good cycling route means something different in every city: safety matters across Europe, while avoiding steep climbs is just as important in hilly places. We are turning that feedback into our next major update with less demanding routes, community challenges, and both sporty and sightseeing loops around Lake Balaton with local landmarks. The ParkSafe community has now grown beyond 2,000 registered users and 4,000 downloads, and the app is available across Europe.",
                        imageAlt: "The ParkSafe team at the Red Bull Basement World Final venue"
                    }
                },
                cta: {
                    title: "Join Us",
                    desc: "Inspired by our story? Be part of the future of urban mobility. Get in touch with us!",
                    button: "Contact Us"
                }
            }
        }
    }
};
