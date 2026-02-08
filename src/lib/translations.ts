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
            rights: '© 2025 ParkSafe. Minden jog fenntartva.',
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
                title: "Fedezd fel a Várost",
                desc: "Interaktív hőtérkép mutatja a biztonságos zónákat és parkolókat."
            },
            step3: {
                title: "Közösségi Validáció",
                desc: "Valós visszajelzések és értékelések segítik a legjobb döntést."
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
            a1: "A ParkSafe egy kifejezetten kerékpárosokra optimalizált digitális térképalkalmazás, amely egyesíti az útvonaltervezést, tárolóhelyeket és szervizeket egyetlen platformon. Jelenleg Szegeden érhető el.",
            q2: "Hogyan működik az útvonaltervezés?",
            a2: "A ParkSafe nem autós, hanem kerékpáros logikára építő útvonalakat ajánl. Figyelembe veszi a kerékpárutak minőségét, biztonságát és a városi közlekedés sajátosságait – nem túrázásra, hanem munkahelyre, egyetemre vagy ügyintézésre való eljutáshoz.",
            q3: "Milyen információkat tartalmaz egy tároló adatlapja?",
            a3: "Minden tárolónál megtalálod: fedett vagy nyitott tárolás, biztonsági szint (van-e kamerás védelem), közösségi értékelések, felhasználói képek és tapasztalatok. Így megalapozott döntést hozhatsz.",
            q4: "Ingyenes a ParkSafe használata?",
            a4: "Igen, a ParkSafe alapfunkciói teljesen ingyenesen használhatók. Jelenleg nincs díjköteles szolgáltatás, a jövőben esetlegesen partneri kedvezmények jelenhetnek meg.",
            q5: "Mennyire megbízhatóak az adatok?",
            a5: "A ParkSafe közösségi alapon működik: felhasználók osztják meg tapasztalataikat, értékelik a helyeket és töltenek fel képeket. Ez biztosítja, hogy az információk naprakészek és valósak legyenek.",
            q6: "Csak Szegeden működik?",
            a6: "Jelenleg a ParkSafe Szegeden érhető el teljes funkcionalitással. A platform tervezetten más városokra is bővül, ha a szegedi validáció sikeres és elegendő felhasználói bázis alakul ki.",
            q7: "Hogyan vehetem fel a kapcsolatot a csapattal?",
            a7: 'A weboldalon található "Írj nekünk" menüponton keresztül tudsz üzenetet küldeni. Minden megkeresésre igyekszünk gyorsan reagálni.',
        },
        partners: {
            title: "Partnerek és Előnyök",
            subtitle: "Mert a közösség ereje kifizetődő.",
            comingSoon: "Hamarosan érkezik!",
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
            checking: "Ellenőrzés...",
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
            errorLength: "A jelszónak legalább 6 karakter hosszúnak kell lennie.",
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
            deleting: "Törlés...",
            changePassword: "Jelszó megváltoztatása",
            currentPassword: "Jelenlegi jelszó",
            newPassword: "Új jelszó",
            confirmNewPassword: "Új jelszó megerősítése",
            changePasswordSuccess: "A jelszó sikeresen megváltoztatva.",
            changePasswordError: "Hiba történt a jelszó változtatása közben.",
            passwordMismatch: "Az új jelszavak nem egyeznek.",
            incorrectPassword: "A jelenlegi jelszó helytelen.",
            saving: "Mentés...",
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
            rights: '© 2025 ParkSafe. All rights reserved.',
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
                title: "Explore the City",
                desc: "Interactive heatmap shows safe zones and parking spots."
            },
            step3: {
                title: "Community Validation",
                desc: "Real feedback and ratings help you make the best choice."
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
            a1: "ParkSafe is a digital map application optimized specifically for cyclists, combining route planning, parking spots, and service stations in one platform. Currently available in Szeged.",
            q2: "How does route planning work?",
            a2: "ParkSafe recommends routes based on cycling logic, not car logic. It considers bike path quality, safety, and urban traffic characteristics – designed for commuting to work, university, or errands, not just touring.",
            q3: "What information is on a parking spot's data sheet?",
            a3: "For every spot, you'll find: covered or open storage, security level (CCTV presence), community ratings, user photos, and experiences. This helps you make an informed decision.",
            q4: "Is ParkSafe free to use?",
            a4: "Yes, ParkSafe's core features are completely free to use. There are currently no paid services; partner discounts may appear in the future.",
            q5: "How reliable is the data?",
            a5: "ParkSafe operates on a community basis: users share their experiences, rate places, and upload photos. This ensures that information is up-to-date and real.",
            q6: "Does it only work in Szeged?",
            a6: "Currently, ParkSafe is available with full functionality in Szeged. The platform is planned to expand to other cities if the Szeged validation is successful and a sufficient user base is established.",
            q7: "How can I contact the team?",
            a7: "You can send a message via the 'Contact Us' menu item on the website. We try to respond to all inquiries quickly.",
        },
        partners: {
            title: "Partners & Benefits",
            subtitle: "Because community power pays off.",
            comingSoon: "Coming Soon!",
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
            checking: "Checking...",
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
            errorLength: "Password must be at least 6 characters long.",
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
            deleting: "Deleting...",
            changePassword: "Change Password",
            currentPassword: "Current Password",
            newPassword: "New Password",
            confirmNewPassword: "Confirm New Password",
            changePasswordSuccess: "Password changed successfully.",
            changePasswordError: "An error occurred while changing the password.",
            passwordMismatch: "New passwords do not match.",
            incorrectPassword: "The current password is incorrect.",
            saving: "Saving...",
        }
    }
};
