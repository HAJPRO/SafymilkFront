<!-- <template>
  <div class="flex justify-end mb-2"></div>
  <div class="grid grid-cols-12 w-full">
    <div class="col-span-4">
      <el-input
        v-model="province"
        @keyup.enter="findCoordinates"
        type="text"
        placeholder="Viloyatni kiriting"
        class="p-1 border rounded-md mb-1 w-full"
        size="smal"
      />
    </div>
    <div class="col-span-4">
      <el-input
        v-model="district"
        @keyup.enter="findCoordinates"
        type="text"
        placeholder="Tuman yoki Shaharni kiriting"
        class="p-1 border rounded-md mb-1 w-full"
        size="smal"
      />
    </div>
    <div class="col-span-4">
      <el-input
        v-model="suburb"
        @keyup.enter="findCoordinates"
        type="text"
        placeholder="Mahalla yoki qishloq nomini kiriting"
        class="p-1 border rounded-md mb-1 w-full"
        size="smal"
      />
    </div>
  </div>
  <div id="map" class="h-[700px] w-full rounded-2xl shadow-xl"></div>
  <div
    class="mb-1 mt-2 col-span-3 w-64 text-center text-white font-semibold rounded-[4px] px-4 py-[5px] cursor-pointer"
    @click="toggleSatellite"
    :class="{
      'bg-green-500 hover:bg-green-600': !isSatellite,
      'bg-purple-500 hover:bg-purple-600-600': isSatellite,
    }"
  >
    <i
      v-if="isSatellite === false"
      class="fa-solid fa-earth-africa mr-2 fa-lg"
    ></i>
    <i v-if="isSatellite === true" class="fa-solid fa-map mr-2 fa-lg"></i
    >{{ isSatellite ? `Xaritada ko'rish` : `Sputnik ko'rinishi` }}
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CustomerManagmentStore } from "../../../stores/Customers/c-managment/customer.store";
const store_managment = CustomerManagmentStore();
import { storeToRefs } from "pinia";
const { modal } = storeToRefs(store_managment);
const IsActive = (is_active) => {
  store_managment.GetIsActive(is_active);
};
const emit = defineEmits(["locationSelected"]);

let map = null;
const selectedMarker = ref(null); // faqat bitta marker saqlanadi
const address = ref(""); // Foydalanuvchi kiritgan manzilni saqlash uchun
// Foydalanuvchi kiritadigan malumotlar
const province = ref("");
const district = ref("");
const suburb = ref("");
const street = ref("");
const houseNumber = ref("");
const osmLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "© OpenStreetMap contributors",
  }
);

const satelliteLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles © Esri",
  }
);

onMounted(() => {
  // map = L.map("map").setView([40.1006, 64.6834], 13);

  map = L.map("map", {
    iconUrl:
      "https://www.freeiconspng.com/uploads/red-location-icon-map-png-4.png",
    center: [40.1006, 64.6834],
    zoom: 13,
    layers: [osmLayer],
  });
  const customIcon = L.icon({
    iconUrl:
      "https://png.pngtree.com/png-vector/20230413/ourmid/pngtree-3d-location-icon-clipart-in-transparent-background-vector-png-image_6704161.png",
    iconSize: [80, 80],
    iconAnchor: [40, 80],
    popupAnchor: [0, -80],
  });

  map.on("click", async (e) => {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    const address = await getAddressFromCoords(lat, lng);
    const popupText = `
      <b><i class="fa-solid fa-map-marker-alt mr-2"></i> Joy nomi:</b> ${
        address.state || "Nomaʼlum"
      }<br>
  <b><i class="fa-solid fa-map mr-2"></i> Viloyat:</b> ${
    address.state || "-"
  }<br>
  <b><i class="fa-solid fa-building mr-2"></i> Tuman:</b> ${
    address.county || "-"
  }<br>
  <b><i class="fa-solid fa-house-user mr-2"></i> Mahalla:</b> ${
    address.suburb || address.village || address.neighbourhood || "-"
  }<br>
  <b><i class="fa-solid fa-road mr-2"></i> Ko‘cha:</b> ${
    address.road || "-"
  }<br>
  <b><i class="fa-solid fa-door-open mr-2"></i> Uy raqami:</b> ${
    address.house_number || "-"
  }<br>
  <b><i class="fa-solid fa-location-dot mr-2"></i> Koordinatalar:</b> ${lat}, ${lng}
    `;

    if (selectedMarker.value) {
      selectedMarker.value.setLatLng([lat, lng]);
    } else {
      selectedMarker.value = L.marker([lat, lng], { icon: customIcon }).addTo(
        map
      );
    }
    emit("locationSelected", { lat, long: lng }); // parentga yuborish
    selectedMarker.value.bindPopup(popupText).openPopup();

    // Agar istasangiz, marker ham qo‘shamiz:
    // L.marker([lat, lng]).addTo(map).bindPopup(`📍 ${lat}, ${lng}`).openPopup()
  });
});

// Joy nomini olish funksiyasi
async function getAddressFromCoords(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`
  );
  const data = await res.json();
  return data.address || {};
}
async function findCoordinates() {
  const address = `${province.value} ${district.value} ${suburb.value} ${street.value} ${houseNumber.value}`;
  if (address) {
    const coordinates = await getCoordinatesFromAddress(address);

    if (coordinates) {
      const { lat, lng } = coordinates;

      if (selectedMarker.value) {
        selectedMarker.value.setLatLng([lat, lng]);
      } else {
        selectedMarker.value = L.marker([lat, lng]).addTo(map);
      }

      map.setView([lat, lng], 13);

      const addressDetails = await getAddressFromCoords(lat, lng);
      console.log(lat, lng);

      emit("locationSelected", { lat, long: lng }); // parentga yuborish
      const popupText = `
  <b><i class="fa-solid fa-map-marker-alt mr-2"></i> Joy nomi:</b> ${
    addressDetails.state || "Nomaʼlum"
  }<br>
  <b><i class="fa-solid fa-map mr-2"></i> Viloyat:</b> ${
    addressDetails.state || "-"
  }<br>
  <b><i class="fa-solid fa-building mr-2"></i> Tuman:</b> ${
    addressDetails.county || "-"
  }<br>
  <b><i class="fa-solid fa-house-user mr-2"></i> Mahalla:</b> ${
    addressDetails.suburb ||
    addressDetails.village ||
    addressDetails.neighbourhood ||
    "-"
  }<br>
 <b><i class="fa-solid fa-road mr-2"></i> Ko'cha:</b> ${
   addressDetails.road ||
   addressDetails.street ||
   addressDetails.pedestrian ||
   addressDetails.footway ||
   "-"
 }<br>
  <b><i class="fa-solid fa-door-open mr-2"></i> Uy raqami:</b> ${
    addressDetails.house_number || addressDetails["addr:housenumber"] || "-"
  }<br>
  <b><i class="fa-solid fa-location-dot mr-2"></i> Koordinatalar:</b> ${lat}, ${lng}
`;

      selectedMarker.value.bindPopup(popupText).openPopup();
      emit("locationSelected", { lat, long: lng });
    } else {
      ElMessage.error("Manzil topilmadi.");
    }
  }
}

async function getCoordinatesFromAddress(address) {
  try {
    // Nominatim API yordamida manzilni geokodlash
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&accept-language=uz`
    );
    const data = await res.json();
    if (data && data[0]) {
      const lat = data[0].lat;
      const lng = data[0].lon;
      return { lat, lng };
    }
  } catch (error) {
    console.error("Xato:", error);
  }
  return null;
}

const isSatellite = ref(false);

async function toggleSatellite() {
  if (!map) return;

  if (isSatellite.value) {
    map.removeLayer(satelliteLayer);
    map.addLayer(osmLayer);
  } else {
    map.removeLayer(osmLayer);
    map.addLayer(satelliteLayer);
  }

  isSatellite.value = !isSatellite.value;
}
</script>

<style scoped>
/* Marker ichidagi rasmni yaxshilash uchun */
.leaflet-marker-icon {
  border-radius: 50%;
  object-fit: cover;
  overflow: hidden;
}
</style> -->
<template>map</template>
