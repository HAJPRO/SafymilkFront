<!-- <template>
  <div class="relative h-screen w-full overflow-hidden bg-gray-100">
    <div id="map" class="h-full w-full z-10"></div>

    <div class="absolute top-4 right-4 z-20 flex flex-col gap-3">
      <button
        @click="toggleSatellite"
        class="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-gray-50 active:scale-95 group"
        :class="{ 'ring-2 ring-indigo-500': isSatellite }"
        title="Xarita turi"
      >
        <i
          class="fa-solid text-xl transition-colors duration-300"
          :class="isSatellite ? 'fa-map text-indigo-600' : 'fa-earth-americas text-gray-600'"
        ></i>
      </button>

      <button
        @click="recenterMap"
        class="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-gray-50 active:scale-95"
        title="Mening joylashuvim"
      >
        <i class="fa-solid fa-location-crosshairs text-xl text-gray-600"></i>
      </button>
    </div>

    <div class="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-white/20">
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span class="text-sm font-bold text-gray-700">Online: {{ drivers.length }} ta</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Socket.IO va Pinia'ga oid importlar olib tashlandi

// 🟢 MOCK/LOKAL MA'LUMOT
const drivers = ref([
    { 
        id: 1, 
        fullname: 'Alijon Sobirov', 
        lat: 40.0950, 
        lng: 64.6750, 
        car_name: 'Lacetti', 
        car_number: '77 K 777 KA',
        orders: 5, 
        age: 30,
        address: { district: 'Markaziy', region: 'Buxoro' },
        avatar: "https://via.placeholder.com/150/0000FF/808080?text=AS"
    },
    { 
        id: 2, 
        fullname: 'Sardor Azimov', 
        lat: 40.1050, 
        lng: 64.6890, 
        car_name: 'Cobalt', 
        car_number: '01 A 123 AA',
        orders: 12, 
        age: 25,
        address: { district: 'Yangi', region: 'Buxoro' },
        avatar: null
    },
    // Va hokazo... (Bu ro'yxat endi API chaqiruvi orqali yangilanishi kerak)
]);

const isSatellite = ref(false);
const userLocation = ref(null); 

let map = null;
const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});
const satelliteLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles &copy; Esri" }
);

let driverMarkers = {};
let driverTrajectories = {};

onMounted(() => {
  // Xaritani boshlash (Buxoro atrofida)
  map = L.map("map", {
    zoomControl: false, 
  }).setView([40.1006, 64.6834], 14);

  osmLayer.addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map); 

  // Geolokatsiya - faqat foydalanuvchi joylashuvini olish uchun qoldirildi
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      userLocation.value = [latitude, longitude];
      // map.setView([latitude, longitude], 14); // Agar o'rtaga avtomatik olib kelish shart bo'lmasa, kommentariyada qoldirish mumkin
    },
    (err) => console.error("Geolokatsiya xatosi:", err),
    { enableHighAccuracy: true }
  );

  // Haydovchilar ro'yxatini kuzatish (Lokal ref yangilansa, xaritani yangilaydi)
  watch(drivers, (newDrivers) => {
    updateMapMarkers(newDrivers);
  }, { deep: true, immediate: true }); // immediate: true - birdaniga ishga tushirish

  // Mock ma'lumotlarni simulyatsiya qilish (API dan keladigan yangilanishga o'xshash)
  // Bu qism faqat test uchun kiritildi, keyinchalik o'chirilishi kerak.
  // setInterval(() => {
  //     drivers.value = drivers.value.map(d => ({
  //         ...d,
  //         lat: d.lat + (Math.random() - 0.5) * 0.001,
  //         lng: d.lng + (Math.random() - 0.5) * 0.001,
  //     }));
  // }, 5000);
});

// Xaritani yangilash funksiyasi (O'zgarishsiz)
const updateMapMarkers = (newDrivers) => {
  const currentDriverIds = newDrivers.map(d => d.id);
  Object.keys(driverMarkers).forEach(id => {
    if (!currentDriverIds.includes(parseInt(id))) {
      map.removeLayer(driverMarkers[id]);
      delete driverMarkers[id];
      if (driverTrajectories[id]) {
        map.removeLayer(driverTrajectories[id]);
        delete driverTrajectories[id];
      }
    }
  });

  newDrivers.forEach((driver) => {
    if (!driver.lat || !driver.lng) return;

    const avatarUrl = driver.avatar || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg";
    
    const customIcon = L.divIcon({
      className: "custom-driver-marker",
      html: `
        <div class="marker-container">
          <div class="marker-pulse"></div>
          <div class="marker-avatar">
            <img src="${avatarUrl}" alt="driver" />
          </div>
          <div class="marker-arrow"></div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 54],
      popupAnchor: [0, -60],
    });

    if (driverMarkers[driver.id]) {
      const marker = driverMarkers[driver.id];
      const oldLatLng = marker.getLatLng();
      const newLatLng = [driver.lat, driver.lng];

      marker.setLatLng(newLatLng);
      marker.setPopupContent(createPopupContent(driver)); 

      if (!driverTrajectories[driver.id]) {
        driverTrajectories[driver.id] = L.polyline([oldLatLng, newLatLng], { color: '#6366f1', weight: 4, opacity: 0.7 }).addTo(map);
      } else {
        driverTrajectories[driver.id].addLatLng(newLatLng);
      }

    } else {
      const marker = L.marker([driver.lat, driver.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(createPopupContent(driver), {
        className: "driver-popup-card",
        closeButton: false,
        maxWidth: 280,
        minWidth: 280
      });
      driverMarkers[driver.id] = marker;
    }
  });
};

// Chiroyli Popup HTML generatsiyasi (O'zgarishsiz)
const createPopupContent = (driver) => {
  const avatarUrl = driver.avatar || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg";
  
  return `
    <div class="flex flex-col overflow-hidden bg-white rounded-xl shadow-sm font-sans">
      <div class="h-16 bg-gradient-to-r from-indigo-500 to-purple-500 relative"></div>
      
      <div class="px-4 pb-4 -mt-8 relative z-10">
        <div class="flex justify-center">
          <img src="${avatarUrl}" class="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover bg-white" />
        </div>
        
        <div class="text-center mt-2">
          <h3 class="font-bold text-gray-800 text-lg leading-tight">${driver.fullname}</h3>
          <span class="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Online
          </span>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div class="bg-gray-50 p-2 rounded-lg border border-gray-100">
            <p class="text-gray-400 text-xs uppercase font-bold">Mashina</p>
            <p class="text-gray-700 font-medium truncate">${driver.car_name || '-'}</p>
          </div>
          <div class="bg-gray-50 p-2 rounded-lg border border-gray-100">
            <p class="text-gray-400 text-xs uppercase font-bold">Raqam</p>
            <p class="text-gray-700 font-medium truncate">${driver.car_number || '-'}</p>
          </div>
          <div class="bg-gray-50 p-2 rounded-lg border border-gray-100 col-span-2">
            <p class="text-gray-400 text-xs uppercase font-bold">Manzil</p>
            <p class="text-gray-700 font-medium truncate">${driver.address?.district || '-'}, ${driver.address?.region || '-'}</p>
          </div>
        </div>
        
        <div class="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
            <span>Buyurtmalar: <b>${driver.orders || 0}</b></span>
            <span>Yosh: <b>${driver.age || 0}</b></span>
        </div>
      </div>
    </div>
  `;
};

// Xarita turini o'zgartirish (O'zgarishsiz)
function toggleSatellite() {
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

// Xaritani foydalanuvchiga qaytarish (O'zgarishsiz)
function recenterMap() {
  if (map && userLocation.value) {
    map.flyTo(userLocation.value, 15, { duration: 1.5 });
  }
}
</script>

<style>
/* Leaflet Marker uchun Custom CSS (O'zgarishsiz qoldirildi) */

.marker-container {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Puls effekti */
.marker-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.4); 
  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.marker-pulse::after {
  content: '';
  position: absolute;
  left: 0; 
  top: 0;
  width: 100%; 
  height: 100%;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.4);
  animation: pulse-dot 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
}

/* Avatar konteyneri */
.marker-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background: white;
  overflow: hidden;
  z-index: 2;
}

.marker-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Marker ostidagi strelka */
.marker-arrow {
  position: absolute;
  bottom: 0px;
  width: 0; 
  height: 0; 
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid white;
  z-index: 1;
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.8; }
  80%, 100% { transform: scale(2); opacity: 0; }
}

@keyframes pulse-dot {
  0% { transform: scale(0.8); }
  50% { transform: scale(1); }
  100% { transform: scale(0.8); }
}

/* Popupni tozalash */
.driver-popup-card .leaflet-popup-content-wrapper {
  background: transparent;
  box-shadow: none;
  padding: 0;
  border-radius: 0;
}
.driver-popup-card .leaflet-popup-content {
  margin: 0;
  width: 100% !important;
}
.driver-popup-card .leaflet-popup-tip {
  background: white;
}
</style> -->
<template>map</template>