import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api/api";
import Icon from "../components/Icon";
import { COMPLAINT_CATEGORIES } from "../constants/complaintConstants";
import { useAuth } from "../context/AuthContext";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const control = "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-ink outline-none transition placeholder:text-slate-400 focus:border-civic-500 focus:bg-white focus:ring-4 focus:ring-civic-100";
const defaultMapCenter = [20.5937, 78.9629];
const locationMarker = L.divIcon({ className: "", html: '<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:#059669;border:3px solid white;box-shadow:0 2px 8px #0006;transform:rotate(-45deg)"></span>', iconSize: [22, 22], iconAnchor: [11, 22] });
let lastGeocodeRequest = 0;

async function respectGeocodingLimit() {
  const remaining = Math.max(0, 1000 - (Date.now() - lastGeocodeRequest));
  if (remaining) await new Promise((resolve) => setTimeout(resolve, remaining));
  lastGeocodeRequest = Date.now();
}

async function findAddress(latitude, longitude) {
  await respectGeocodingLimit();
  const reverseGeocodeUrl = new URL("https://nominatim.openstreetmap.org/reverse");
  reverseGeocodeUrl.searchParams.set("lat", latitude);
  reverseGeocodeUrl.searchParams.set("lon", longitude);
  reverseGeocodeUrl.searchParams.set("format", "jsonv2");
  reverseGeocodeUrl.searchParams.set("addressdetails", "1");
  reverseGeocodeUrl.searchParams.set("zoom", "18");
  reverseGeocodeUrl.searchParams.set("layer", "address");
  reverseGeocodeUrl.searchParams.set("accept-language", navigator.language || "en");
  const response = await fetch(reverseGeocodeUrl);
  if (!response.ok) throw new Error("Address service is unavailable");
  const location = await response.json();
  if (!location.display_name?.trim()) throw new Error("No address was returned");
  return location.display_name.trim();
}

async function findCoordinates(address) {
  await respectGeocodingLimit();
  const searchUrl = new URL("https://nominatim.openstreetmap.org/search");
  searchUrl.searchParams.set("q", address);
  searchUrl.searchParams.set("format", "jsonv2");
  searchUrl.searchParams.set("addressdetails", "1");
  searchUrl.searchParams.set("limit", "1");
  searchUrl.searchParams.set("accept-language", navigator.language || "en");
  const response = await fetch(searchUrl);
  if (!response.ok) throw new Error("Address service is unavailable");
  const [location] = await response.json();
  if (!location) throw new Error("Address was not found");
  return { latitude: Number(location.lat), longitude: Number(location.lon), address: location.display_name.trim() };
}

function NewComplaintPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "", category: "", ward: user?.ward || "", address: "", latitude: null, longitude: null });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const [mapPosition, setMapPosition] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const previews = useMemo(() => images.map((file) => ({ file, url: URL.createObjectURL(file) })), [images]);

  useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews]);

  function handleChange({ target: { name, value } }) {
    setFormData((current) => ({ ...current, [name]: value, ...(name === "address" ? { latitude: null, longitude: null } : {}) }));
  }

  function handleImages(fileList) {
    const selected = Array.from(fileList).slice(0, 5);
    const invalid = selected.find((file) => !allowedImageTypes.has(file.type) || file.size > 5 * 1024 * 1024);
    if (invalid) {
      setImages([]);
      setError(`${invalid.name} must be a JPEG, PNG or WebP image no larger than 5 MB`);
      return;
    }
    setError("");
    setImages(selected);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return setError("Location services are not supported by this browser");
    setLocating(true); setError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const latitude = Number(coords.latitude.toFixed(6));
        const longitude = Number(coords.longitude.toFixed(6));
        setMapPosition([latitude, longitude]);
        try {
          const address = await findAddress(latitude, longitude);
          setFormData((current) => ({ ...current, address, latitude, longitude }));
        } catch {
          setError("Unable to identify the address automatically. Please enter the street or landmark manually.");
          setFormData((current) => ({ ...current, address: "", latitude, longitude }));
        } finally {
          setLocating(false);
        }
      },
      (locationError) => {
        const messages = { 1: "Location permission was denied. Allow location access and try again.", 2: "Your current location could not be determined.", 3: "Location request timed out. Please try again." };
        setError(messages[locationError.code] || "Unable to get your current location");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  }

  async function handleMapPin(latitude, longitude) {
    const preciseLatitude = Number(latitude.toFixed(6));
    const preciseLongitude = Number(longitude.toFixed(6));
    setMapPosition([preciseLatitude, preciseLongitude]);
    setLocating(true);
    setError("");
    try {
      const address = await findAddress(preciseLatitude, preciseLongitude);
      setFormData((current) => ({ ...current, address, latitude: preciseLatitude, longitude: preciseLongitude }));
    } catch {
      setError("Unable to identify the address at that point. Try a nearby point or enter the address manually.");
      setFormData((current) => ({ ...current, latitude: preciseLatitude, longitude: preciseLongitude }));
    } finally {
      setLocating(false);
    }
  }

  async function locateTypedAddress() {
    const typedAddress = formData.address.trim();
    if (typedAddress.length < 5) return setError("Enter a street, area and city before searching the map");
    setLocating(true);
    setError("");
    try {
      const location = await findCoordinates(typedAddress);
      setMapPosition([location.latitude, location.longitude]);
      setFormData((current) => ({ ...current, address: location.address, latitude: location.latitude, longitude: location.longitude }));
    } catch {
      setError("That address was not found. Add the city, postcode or a nearby landmark and try again.");
    } finally {
      setLocating(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (formData.title.trim().length < 5) return setError("Title must contain at least 5 characters");
    if (formData.description.trim().length < 10) return setError("Description must contain at least 10 characters");
    if (!images.length) return setError("Add at least one complaint photo before submitting");
    try {
      setSubmitting(true);
      const response = await api.post("/complaints", {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        ward: formData.ward,
        location: { address: formData.address, latitude: formData.latitude, longitude: formData.longitude },
      });
      if (images.length) {
        const uploadData = new FormData();
        images.forEach((image) => uploadData.append("images", image));
        await api.post(`/complaints/${response.data.complaint._id}/images`, uploadData);
      }
      navigate(`/complaints/${response.data.complaint._id}`, { replace: true, state: { successMessage: "Complaint and evidence submitted successfully" } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit complaint");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-7 xl:grid-cols-[1fr_320px]">
      <section>
        <div className="mb-7"><div className="flex items-center gap-2 text-sm font-bold text-civic-700"><span className="grid h-8 w-8 place-items-center rounded-lg bg-civic-100"><Icon name="plus" className="h-4 w-4" /></span>New complaint</div><h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Tell us what needs attention</h1><p className="mt-2 max-w-2xl text-slate-500">Clear details help your ward team understand and resolve the issue faster.</p></div>
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {error && <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><Icon name="alert" className="h-5 w-5 shrink-0" />{error}</div>}
          <div className="grid gap-6 sm:grid-cols-2">
            <Field className="sm:col-span-2" label="What is the issue?" htmlFor="title"><input id="title" name="title" required minLength={5} maxLength={120} value={formData.title} onChange={handleChange} placeholder="Example: Large pothole near the bus stop" className={control} /></Field>
            <Field label="Category" htmlFor="category"><select id="category" name="category" required value={formData.category} onChange={handleChange} className={control}><option value="">Choose a category</option>{COMPLAINT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></Field>
            <Field label="Ward" htmlFor="ward"><input id="ward" name="ward" required value={formData.ward} onChange={handleChange} placeholder="Example: Ward 12" className={control} /></Field>
            <Field className="sm:col-span-2" label="Describe the problem" htmlFor="description"><textarea id="description" name="description" required minLength={10} maxLength={2000} rows={6} value={formData.description} onChange={handleChange} placeholder="What happened? How severe is it?" className={`${control} resize-y`} /><div className="mt-2 flex justify-between text-xs text-slate-400"><span>Include useful landmarks and safety concerns.</span><span>{formData.description.length}/2000</span></div></Field>
            <Field className="sm:col-span-2" label="Exact location" htmlFor="address"><div className="relative"><Icon name="location" className="absolute left-4 top-4 h-5 w-5 text-slate-400" /><textarea id="address" name="address" required rows={3} value={formData.address} onChange={handleChange} placeholder="Enter house number, street, area and city" className={`${control} resize-y pl-12`} /></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="max-w-xl text-xs text-slate-500">Type a complete address and find it on the map, or zoom in and place the pin yourself. Address data © OpenStreetMap contributors.</p><div className="flex flex-wrap gap-2"><button type="button" disabled={locating || submitting} onClick={locateTypedAddress} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"><Icon name="search" className="h-4 w-4" />Find typed address</button><button type="button" disabled={locating || submitting} onClick={useCurrentLocation} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"><Icon name="location" className="h-4 w-4" />{locating ? "Finding address..." : "Use device location"}</button></div></div></Field>
            <LocationMap position={mapPosition} address={formData.address} onPin={handleMapPin} disabled={locating || submitting} />
            <Field className="sm:col-span-2" label="Photo evidence (required)" htmlFor="images">
              <label htmlFor="images" className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-7 text-center transition hover:border-emerald-300 hover:bg-emerald-50/30"><Icon name="plus" className="h-7 w-7 text-emerald-600" /><span className="mt-3 text-sm font-bold text-slate-700">Choose up to 5 images</span><span className="mt-1 text-xs text-slate-400">JPEG, PNG or WebP / 5 MB each</span><input id="images" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => handleImages(event.target.files)} className="sr-only" /></label>
              {previews.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">{previews.map(({ file, url }, index) => <div key={`${file.name}-${file.lastModified}`} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"><img src={url} alt={`Selected evidence ${index + 1}`} className="h-28 w-full object-cover" /><button type="button" onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} aria-label={`Remove ${file.name}`} title="Remove photo" className="absolute right-2 top-1 grid h-9 w-9 place-items-center bg-transparent text-3xl font-light leading-none text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)] transition hover:scale-110 hover:text-red-400">&times;</button><p className="truncate px-2 py-2 text-[10px] font-semibold text-slate-500">{file.name}</p></div>)}</div>}
            </Field>
          </div>
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><button type="button" onClick={() => navigate("/dashboard")} disabled={submitting} className="rounded-xl border border-slate-200 px-5 py-3.5 font-bold text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 rounded-xl bg-civic-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-civic-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? (images.length ? "Submitting and uploading..." : "Submitting...") : "Submit complaint"}<Icon name="arrow" /></button></div>
        </form>
      </section>
      <aside className="space-y-5 xl:pt-28"><div className="rounded-3xl bg-[#182b4d] p-6 text-white"><Icon name="shield" className="h-8 w-8 text-teal-300" /><h2 className="mt-5 text-lg font-bold">Before you submit</h2><ul className="mt-4 space-y-4 text-sm text-slate-300">{["Use a clear, specific title", "Describe the exact location", "Submit one issue per complaint"].map((tip) => <li key={tip} className="flex gap-3"><Icon name="check" className="h-5 w-5 shrink-0" />{tip}</li>)}</ul></div></aside>
    </div>
  );
}

function Field({ className = "", label, htmlFor, children }) { return <div className={className}><label htmlFor={htmlFor} className="mb-2 block text-sm font-bold text-slate-700">{label}</label>{children}</div>; }

function LocationMap({ position, address, onPin, disabled }) {
  return <div className="sm:col-span-2 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm"><div className="border-b border-emerald-100 px-4 py-3"><p className="text-sm font-bold text-slate-800">Pin the complaint location</p><p className="mt-1 text-xs text-slate-500">Zoom to street level, click the exact place, or drag the green marker to correct it.</p></div><MapContainer center={position || defaultMapCenter} zoom={position ? 18 : 5} scrollWheelZoom className="h-80 w-full"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} /><MapInteraction position={position} onPin={onPin} disabled={disabled} />{position && <Marker position={position} icon={locationMarker} draggable={!disabled} eventHandlers={{ dragend(event) { const point = event.target.getLatLng(); onPin(point.lat, point.lng); } }}><Popup><p className="max-w-64 text-xs font-semibold leading-5">{address || "Finding address..."}</p></Popup></Marker>}</MapContainer></div>;
}

function MapInteraction({ position, onPin, disabled }) {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, 18); }, [map, position]);
  useMapEvents({ click(event) { if (!disabled) onPin(event.latlng.lat, event.latlng.lng); } });
  return null;
}

export default NewComplaintPage;
