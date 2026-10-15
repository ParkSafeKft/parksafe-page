"use client";
import { Download, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import {
  AdminModalBody,
  AdminModalContent,
  AdminModalFooter,
  AdminModalHeader,
  AdminModalSection,
} from "./AdminModal";
import type { StreetCount } from "./regionExport";
import styles from "./RegionExportPanel.module.css";
interface RegionExportPanelProps {
  loading: boolean;
  imageUrl: string | null;
  rows: StreetCount[];
  error: "image" | "streets" | null;
  onClose: () => void;
  onDownloadPng: () => void;
  onDownloadCsv: () => void;
}
export default function RegionExportPanel({
  loading,
  imageUrl,
  rows,
  error,
  onClose,
  onDownloadPng,
  onDownloadCsv,
}: RegionExportPanelProps) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AdminModalContent
        variant="inspector"
        className={styles.dialog}
        portalContainer={
          typeof document === "undefined"
            ? undefined
            : document.fullscreenElement
        }
        overlayClassName="z-[1300]"
      >
        <AdminModalHeader
          title="Régió exportálása"
          eyebrow="Útvonal-hőtérkép"
          subtitle="A kijelölt nézet képe és a legtöbb tekerést összegyűjtő utcák."
          meta={`${rows.length} utca`}
        />
        <AdminModalBody>
          <div className={styles.grid}>
            <AdminModalSection title="Térkép előnézete">
              {imageUrl ? (
                <ImageWithFallback
                  src={imageUrl}
                  alt="A kijelölt régió térképe"
                  className={styles.preview}
                />
              ) : (
                <p className={styles.empty} role="status">
                  {error === "image"
                    ? "A térképkép mentése nem sikerült. Próbáld újra a régió exportálását."
                    : "Nincs megjeleníthető térképkép."}
                </p>
              )}
            </AdminModalSection>
            <AdminModalSection title="Legforgalmasabb utcák">
              {loading ? (
                <p className={styles.empty} role="status">
                  <Loader2 aria-hidden="true" />
                  Utcák betöltése…
                </p>
              ) : !rows.length ? (
                <p
                  className={styles.empty}
                  role={error === "streets" ? "alert" : "status"}
                >
                  {error === "streets"
                    ? "Az utcaadatok lekérése nem sikerült."
                    : "Nincs utca a kijelölt régióban."}
                </p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Utca</th>
                      <th scope="col">Tekerések</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.name}>
                        <th scope="row">{row.name}</th>
                        <td>{row.rides.toLocaleString("hu-HU")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </AdminModalSection>
          </div>
        </AdminModalBody>
        <AdminModalFooter>
          <span>A kijelölt térképnézet adatai</span>
          <div>
            <Button
              variant="outline"
              onClick={onDownloadCsv}
              disabled={loading || !rows.length}
            >
              <Download aria-hidden="true" />
              CSV letöltése
            </Button>
            <Button onClick={onDownloadPng} disabled={!imageUrl}>
              <Download aria-hidden="true" />
              PNG letöltése
            </Button>
          </div>
        </AdminModalFooter>
      </AdminModalContent>
    </Dialog>
  );
}
