export interface NavEintrag {
  href: string;
  label: string;
  icon?: string;
  beschreibung?: string;
  rollen?: ("admin" | "orga" | "kasse" | "kuenstler")[];
  crumbLabel?: string;
  crumbParent?: string;
}

export const ADMIN_NAV: NavEintrag[] = [
  // Hauptkacheln
  {
    href: "/admin/kuenstler",
    label: "Künstler anlegen & pflegen",
    icon: "🎨",
    beschreibung: "Künstler registrieren & einladen",
    rollen: ["admin", "orga"],
    crumbLabel: "Künstler anlegen & pflegen",
  },
  {
    href: "/admin/bilder",
    label: "Bildverwaltung",
    icon: "🖼️",
    beschreibung: "Bilder freigeben, Preise bestätigen",
    rollen: ["admin", "orga"],
    crumbLabel: "Bildverwaltung",
  },
  {
    href: "/admin/merklisten",
    label: "Besucher-Merklisten",
    icon: "♡",
    beschreibung: "Favoriten & Interesse der Besucher",
    rollen: ["admin", "orga"],
    crumbLabel: "Besucher-Merklisten",
  },
  {
    href: "/admin/kaufanfragen",
    label: "Kaufanfragen",
    icon: "🛒",
    beschreibung: "Online-Kaufabsichten & Versandabwicklung",
    rollen: ["admin", "orga"],
    crumbLabel: "Kaufanfragen",
  },
  {
    href: "/admin/kasse",
    label: "Vor-Ort-Kasse",
    icon: "🧾",
    beschreibung: "Käufe erfassen & Zahlungen verwalten",
    crumbLabel: "Vor-Ort-Kasse",
  },
  {
    href: "/admin/kaeufer",
    label: "Käufer",
    icon: "👤",
    beschreibung: "Käuferverwaltung & Kaufhistorie",
    crumbLabel: "Käufer",
  },
  {
    href: "/admin/kaufuebersicht",
    label: "Kaufübersicht",
    icon: "📋",
    beschreibung: "Alle Verkäufe & Zahlungsstatus",
    crumbLabel: "Kaufübersicht",
  },
  {
    href: "/admin/going-live",
    label: "Going Live",
    icon: "🚀",
    beschreibung: "Checkliste Liveschaltung",
    rollen: ["admin", "orga"],
    crumbLabel: "Going Live",
  },
  {
    href: "/admin/org-abwicklung",
    label: "Organisation und Abwicklung",
    icon: "📋",
    beschreibung: "Veranstaltungsplanung & Checklisten",
    rollen: ["admin", "orga"],
    crumbLabel: "Organisation und Abwicklung",
  },
  {
    href: "/admin/nachrichten",
    label: "Kommunikation",
    icon: "✉️",
    beschreibung: "Newsletter & Infos an Künstler",
    rollen: ["admin", "orga"],
    crumbLabel: "Kommunikation",
  },
  {
    href: "/admin/organisation",
    label: "Organisation",
    icon: "🗂️",
    beschreibung: "Platzplan, Raumplan & Bildaufsteller",
    rollen: ["admin", "orga"],
    crumbLabel: "Organisation",
  },
  {
    href: "/admin/benutzer",
    label: "Benutzerverwaltung",
    icon: "👥",
    beschreibung: "Konten anlegen, Rollen & Einladungen",
    rollen: ["admin"],
    crumbLabel: "Benutzerverwaltung",
  },
  {
    href: "/admin/einstellungen",
    label: "Einstellungen",
    icon: "⚙️",
    beschreibung: "Eigenes Passwort ändern",
    crumbLabel: "Einstellungen",
  },
  {
    href: "/admin/sonstiges",
    label: "Sonstiges",
    icon: "📁",
    beschreibung: "DATEV, Import, Archiv, Impressum & Datenschutz",
    rollen: ["admin", "orga"],
    crumbLabel: "Sonstiges",
  },
  // Unterseiten Organisation
  {
    href: "/admin/plaetze",
    label: "Platzplan",
    crumbLabel: "Platzplan",
    crumbParent: "/admin/organisation",
  },
  {
    href: "/admin/raumplan",
    label: "Raumplan",
    crumbLabel: "Raumplan",
    crumbParent: "/admin/organisation",
  },
  {
    href: "/admin/bilder/aufsteller",
    label: "Bildaufsteller",
    crumbLabel: "Bildaufsteller",
    crumbParent: "/admin/organisation",
  },
  // Unterseiten Sonstiges
  {
    href: "/admin/export",
    label: "DATEV-Export",
    crumbLabel: "DATEV-Export",
    crumbParent: "/admin/sonstiges",
  },
  {
    href: "/admin/import",
    label: "CSV / Excel Import",
    crumbLabel: "CSV / Excel Import",
    crumbParent: "/admin/sonstiges",
  },
  {
    href: "/admin/archiv",
    label: "Archivierung",
    crumbLabel: "Archivierung",
    crumbParent: "/admin/sonstiges",
  },
  {
    href: "/admin/impressum",
    label: "Impressum",
    crumbLabel: "Impressum",
    crumbParent: "/admin/sonstiges",
  },
  {
    href: "/admin/datenschutz",
    label: "Datenschutz",
    crumbLabel: "Datenschutz",
    crumbParent: "/admin/sonstiges",
  },
];
