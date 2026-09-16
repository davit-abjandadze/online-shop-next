import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Branch } from "@/API_Client/types";

// mapbox-gl-ს ნაცვლად maplibre-gl გამოვიყენეთ: mapbox-gl (v2+) კომერციული
// ლიცენზიითაა და საკუთარი (non-Mapbox) style/tiles-ითაც კი მოითხოვს ვალიდურ
// access token-ს — მისი გარეშე ბიბლიოთეკა ტაილების ჩატვირთვას "ჩუმად" ბლოკავს
// (მარკერები და კონტროლები მაინც ჩანდა, რადგან ისინი ტაილებზე დამოკიდებული
// არაა — ამიტომაც ჩანდა მხოლოდ pin ცარიელ რუკაზე). maplibre-gl არის mapbox-gl-ის
// ღია კოდის (BSD-3) ფორკი, იგივე API-ით, token-ის გარეშე.
//
// CARTO-ს უფასო basemaps.cartocdn.com ტაილებმა API key-ს მოთხოვნა დაიწყეს
// (ტაილებზე "API KEY REQUIRED" ჩანდა key-ის გარეშე), ამიტომ OpenFreeMap-ზე
// გადავედით — თავისუფალი, key-ის გარეშე, სპეციალურად MapLibre GL-ისთვის
// განკუთვნილი ჰოსტინგი (https://openfreemap.org).
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// maplibre-gl-ის დეფოლტი worker-ი ES module Worker-ია, რომლის URL-საც
// ბიბლიოთეკა `import.meta.url`-იდან თვითონ ითვლის — Next.js-ის webpack
// ბანდლში ეს არასწორ (ან Next-ის page route-ზე გადამისამართებულ) URL-ს
// აწარმოებდა, სერვერიც HTML 404-გვერდს (text/html) აბრუნებდა JS-ის
// ნაცვლად, რაც "Failed to load module script" შეცდომას იწვევდა და
// ვექტორული ტაილების parsing-ს (რაც worker-ში ხდება) საერთოდ ბლოკავდა —
// ამიტომაც ჩანდა მხოლოდ ფონი, გზების/წარწერების გარეშე. ამის გამოსასწორებლად
// worker.mjs public/-ში გავიტანეთ (სტატიკურად, სწორი Content-Type-ით
// მოწოდებული) და მისი URL პირდაპირ მივუთითეთ. worker.mjs შიგნით
// `./maplibre-gl-shared.mjs`-ს დინამიურად import-ავს — ისიც უნდა იყოს
// იმავე public/maplibre-gl/ საქაღალდეში, თორემ worker 404-ზე ჩუმად
// ვერ ინიციალიზდება და ვექტორული ტაილები (გზები/წარწერები) არ გამოისახება.
// maplibre-gl-ის განახლებისას ორივე ფაილი ხელახლა უნდა დაკოპირდეს
// node_modules/maplibre-gl/dist/-იდან.
if (typeof window !== "undefined") {
  maplibregl.setWorkerUrl(`${window.location.origin}/maplibre-gl/maplibre-gl-worker.mjs`);
}

interface BranchMapProps {
  branches: Branch[];
  selectedId: number | null;
  onSelectBranch: (id: number) => void;
}

const DEFAULT_CENTER: [number, number] = [44.7833, 41.7167]; // თბილისი

// ბექენდიდან lat/lng ზოგჯერ სტრინგადაც მოდის (Postgres numeric/decimal
// სვეტების ტიპური ქცევა), თუმცა Branch ტიპში number-ადაა აღწერილი —
// ამიტომ Number(...)-ით ვაკონვერტირებთ და Number.isFinite-ით ვამოწმებთ
// (და არა პირდაპირ Number.isFinite(branch.latitude), რაც string-ზე
// ყოველთვის false დააბრუნებდა და ყველა ფილიალს გაფილტრავდა).
const getCoords = (branch: Branch): [number, number] => [Number(branch.longitude), Number(branch.latitude)];

// ფილიალს, რომელსაც სწორი lat/lng არ აქვს მითითებული (ცარიელი ან (0,0) —
// "null island"), bounds-გამოთვლიდან და მარკერებიდან ვრიცხავთ. წინააღმდეგ
// შემთხვევაში ერთი არასწორი ჩანაწერი (0,0) fitBounds-ს მთელ მსოფლიოზე
// აიძულებდა გაზუმვას, თბილისის ფილიალების ხარჯზე.
const hasValidCoords = (branch: Branch) => {
  const [lng, lat] = getCoords(branch);
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
};

// მარკერი მარტივ DOM ელემენტადაა აგებული (და არა ცალკე React root-ით),
// რადგან maplibregl.Marker-ის element-ს React-ის outer render-ისგან
// დამოუკიდებლად ვამონტაჟებთ/ვშლით — ცალკე root-ის სინქრონული unmount-ი
// React 18-ში "Attempted to synchronously unmount a root while React was
// already rendering" გაფრთხილებას/რასის პირობას იწვევდა.
const createMarkerElement = (active: boolean) => {
  const el = document.createElement("div");
  el.style.width = "32px";
  el.style.height = "32px";
  el.style.borderRadius = "50% 50% 50% 0";
  el.style.transform = "rotate(-45deg)";
  el.style.boxShadow = "var(--ref-shadow-md)";
  el.style.cursor = "pointer";
  el.style.border = "2px solid var(--ref-bg-elevated)";
  el.style.background = active ? "var(--ref-primary)" : "var(--ref-accent)";
  return el;
};

const setMarkerActive = (el: HTMLDivElement, active: boolean) => {
  el.style.background = active ? "var(--ref-primary)" : "var(--ref-accent)";
};

const BranchMap: React.FC<BranchMapProps> = ({ branches, selectedId, onSelectBranch }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<number, { marker: maplibregl.Marker; el: HTMLDivElement }>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: 11,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(({ marker }) => {
      marker.remove();
    });
    markersRef.current.clear();

    const validBranches = branches.filter(hasValidCoords);

    validBranches.forEach((branch) => {
      const el = createMarkerElement(branch.id === selectedId);

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(getCoords(branch))
        .addTo(map);

      el.addEventListener("click", () => onSelectBranch(branch.id));
      markersRef.current.set(branch.id, { marker, el });
    });

    if (validBranches.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      validBranches.forEach((b) => bounds.extend(getCoords(b)));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches]);

  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      setMarkerActive(el, id === selectedId);
    });

    const map = mapRef.current;
    const branch = branches.find((b) => b.id === selectedId);
    if (!map || !branch || !hasValidCoords(branch)) return;
    map.flyTo({ center: getCoords(branch), zoom: 15, duration: 500 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default BranchMap;
