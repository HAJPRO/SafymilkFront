<template>
  <div :class="{ 'dark': isDarkMode }" class="antialiased">
    <div class="flex h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-all duration-500 overflow-hidden">
      
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-24 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-xl px-8 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
          <h2 class="text-xl font-black uppercase italic tracking-tighter">Loyiha <span class="text-indigo-600">Boshqaruvi</span></h2>
          
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-2xl border dark:border-white/5">
              <span class="text-[9px] font-black text-slate-400 uppercase">Foydalanuvchi:</span>
              <div class="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white uppercase">{{ currentUser.charAt(0) }}</div>
              <select v-model="currentUser" class="bg-transparent border-none text-[11px] font-black outline-none cursor-pointer">
                <option v-for="u in allUsers" :key="u" :value="u">{{ u }}</option>
              </select>
            </div>
            <button @click="openCreateModal" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
              + Yangi Vazifa
            </button>
          </div>
        </header>

        <main class="flex-1 overflow-x-auto p-8 bg-slate-50/50 dark:bg-[#020617]/40 no-scrollbar">
          <div class="flex gap-8 h-full min-w-max">
            <div v-for="column in boardData" :key="column.id" @dragover.prevent @drop="onDrop($event, column.id)" class="w-80 flex flex-col">
              <div class="flex items-center gap-3 mb-6 px-2">
                <div :class="column.color" class="w-2.5 h-2.5 rounded-full shadow-lg shadow-current/50"></div>
                <h2 class="font-black uppercase text-[11px] tracking-widest text-slate-500 dark:text-slate-400">{{ column.name }}</h2>
              </div>

              <div class="flex-1 overflow-y-auto space-y-4 px-1 pb-10 custom-v-scroll">
                <transition-group name="tasks-list">
                  <div v-for="task in filteredTasks(column.tasks)" :key="task.id" draggable="true" @dragstart="onDragStart($event, task, column.id)"
                       class="bg-white dark:bg-[#0c1222] rounded-[1.5rem] border border-slate-200 dark:border-white/5 p-5 group hover:shadow-2xl transition-all duration-300 relative cursor-grab active:cursor-grabbing">
                    
                    <div v-if="task.image" class="w-full h-32 mb-4 rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5">
                      <img :src="task.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>

                    <div class="flex gap-2 mb-3">
                      <span :class="getPriorityStyle(task.priority)" class="px-2 py-0.5 rounded text-[7px] font-black uppercase">{{ task.priority }}</span>
                      <span class="text-[7px] font-bold text-slate-400 uppercase">👤 {{ task.creator }}</span>
                    </div>

                    <h3 class="text-sm font-black mb-2 group-hover:text-indigo-500 transition-colors">{{ task.title }}</h3>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 italic mb-4">"{{ task.desc }}"</p>

                    <div class="flex items-center justify-between pt-4 border-t dark:border-white/5">
                      <div class="flex gap-2">
                        <button @click="openChat(task)" class="relative p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                          <span v-if="task.comments.length" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full font-black">{{ task.comments.length }}</span>
                        </button>
                        
                        <button v-if="task.creator === currentUser" @click="editTask(task)" class="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-500 transition-all">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                      </div>

                      <div class="flex -space-x-2">
                        <div v-for="p in task.assignees" :key="p" class="w-7 h-7 rounded-full border-2 border-white dark:border-[#0c1222] bg-indigo-500 text-[8px] font-black flex items-center justify-center text-white uppercase">{{ p.charAt(0) }}</div>
                      </div>
                    </div>
                  </div>
                </transition-group>
              </div>
            </div>
          </div>
        </main>
      </div>

      <transition name="modal">
        <div v-if="modal.show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
          <div class="bg-white dark:bg-[#0c1222] w-full max-w-2xl h-[95vh] rounded-[2.5rem] shadow-2xl border dark:border-white/10 flex flex-col overflow-hidden scale-in">
            
            <div class="p-6 border-b dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#0c1222] z-10">
              <div class="flex flex-col">
                <h2 class="text-lg font-black uppercase italic">{{ modal.isEdit ? 'Tahrirlash' : 'Yangi' }} <span class="text-indigo-600">Vazifa</span></h2>
                <span v-if="modal.isEdit" class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Yaratuvchi: {{ form.creator }}</span>
              </div>
              <button @click="modal.show = false" class="text-slate-400 hover:text-rose-500 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto custom-v-scroll scroll-smooth" id="modalBodyScroll">
              <div class="p-8 space-y-8">
                
                <div :class="{ 'opacity-60 pointer-events-none': modal.isEdit && form.creator !== currentUser }" class="space-y-8">
                  <div class="space-y-3">
                    <label class="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Kover Rasm</label>
                    <div @click="$refs.fileInput.click()" class="relative h-48 w-full bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                      <img v-if="form.image" :src="form.image" class="absolute inset-0 w-full h-full object-cover" />
                      <p v-else class="text-[10px] font-black text-slate-400 uppercase">Rasm yuklash 🖼️</p>
                      <input type="file" ref="fileInput" @change="uploadImage" class="hidden" accept="image/*" />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-2 col-span-2">
                      <label class="text-[10px] font-black uppercase text-slate-400 ml-2">Sarlavha</label>
                      <input v-model="form.title" class="w-full bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-2 ring-indigo-500 font-bold text-sm" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-black uppercase text-slate-400 ml-2">Prioritet</label>
                      <select v-model="form.priority" class="w-full bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-2xl outline-none font-black text-xs">
                        <option value="Urgent">🔴 Urgent</option><option value="High">🟠 High</option><option value="Medium">🟡 Medium</option><option value="Low">🟢 Low</option>
                      </select>
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-black uppercase text-slate-400 ml-2">Muddat</label>
                      <input type="date" v-model="form.deadline" class="w-full bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-2xl outline-none font-bold text-xs" />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase text-slate-400 ml-2">Tavsif</label>
                    <textarea v-model="form.desc" class="w-full bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-2xl h-24 outline-none resize-none text-sm"></textarea>
                  </div>
                </div>

                <div v-if="modal.isEdit && form.creator !== currentUser" class="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                  <p class="text-[10px] font-black text-amber-500 uppercase text-center italic">Siz faqat izoh qoldirishingiz mumkin. Faqat muallif tahrirlay oladi.</p>
                </div>

                <div v-if="modal.isEdit" id="chatSection" class="pt-10 border-t dark:border-white/5 space-y-6">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-black uppercase text-indigo-500 italic tracking-widest">Muhokama</h3>
                  </div>

                  <div class="bg-slate-50 dark:bg-black/20 rounded-[2.5rem] p-6 min-h-[400px] flex flex-col space-y-4">
                    <div v-for="(msg, idx) in form.comments" :key="idx" :class="msg.user === currentUser ? 'items-end' : 'items-start'" class="flex flex-col group animate-slide-up">
                      <div v-if="msg.replyTo" class="mb-[-15px] bg-slate-200/50 dark:bg-white/5 px-3 py-1 pb-4 rounded-t-xl text-[9px] opacity-60 italic max-w-[70%] truncate">↩️ {{ msg.replyTo }}</div>
                      <div class="max-w-[85%] relative">
                        <div :class="msg.user === currentUser ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' : 'bg-white dark:bg-[#1e2738] text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none'" class="px-4 py-3 text-[13px] shadow-sm">
                          <p v-if="msg.user !== currentUser" class="text-[9px] font-black text-indigo-400 mb-1 uppercase">{{ msg.user }}</p>
                          {{ msg.text }}
                          <div class="flex items-center justify-end mt-1 opacity-50 text-[8px] font-bold uppercase">{{ msg.time }}</div>
                        </div>
                        <div class="absolute top-1/2 -translate-y-1/2 -left-10 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1" :class="{'left-auto -right-10': msg.user === currentUser}">
                          <button @click="setReply(msg)" class="p-1.5 hover:bg-indigo-500/10 rounded-full text-indigo-500 text-xs">↩️</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="bg-white dark:bg-[#0c1222] sticky bottom-0 py-4 space-y-3 z-20">
                    <div v-if="replyingTo" class="mx-2 p-2 bg-indigo-500/5 rounded-xl flex items-center justify-between border-l-4 border-indigo-600">
                      <div class="text-[10px] truncate italic opacity-60 pl-2">Javob: "{{ replyingTo.text }}"</div>
                      <button @click="replyingTo = null" class="text-sm font-bold p-1">✕</button>
                    </div>
                    <div class="flex items-center gap-3 bg-slate-100 dark:bg-white/5 p-2 rounded-3xl border dark:border-white/5">
                      <input v-model="newMessage" @keyup.enter="sendComment" placeholder="Xabar yozish..." class="flex-1 bg-transparent px-4 py-2 outline-none text-sm font-medium rounded-xl" />
                      <button @click="sendComment" :disabled="!newMessage.trim()" class="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                        <svg class="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex gap-4 pt-4 border-t dark:border-white/5">
                  <button v-if="modal.isEdit && form.creator === currentUser" @click="confirmDelete" class="flex-1 py-4 text-rose-500 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500/5 rounded-2xl transition-all">O'chirish</button>
                  <button v-if="!modal.isEdit || form.creator === currentUser" @click="handleTaskSubmit" class="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-500 transition-all">
                    {{ modal.isEdit ? 'Saqlash' : 'Yaratish' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';

const isDarkMode = ref(true);
const currentUser = ref('Sardorbek');
const allUsers = ['Sardorbek', 'Ali', 'Bekzod', 'Gulnoza', 'Dizayner'];

const boardData = ref([
  { id: 1, name: 'Reja', color: 'bg-indigo-500', tasks: [] },
  { id: 2, name: 'Jarayon', color: 'bg-amber-400', tasks: [] },
  { id: 3, name: 'Tekshiruv', color: 'bg-blue-400', tasks: [] },
  { id: 4, name: 'Tayyor', color: 'bg-emerald-500', tasks: [] }
]);

const modal = reactive({ show: false, id: null, isEdit: false });
const form = reactive({ title: '', desc: '', assignees: [], deadline: '', image: null, priority: 'Medium', comments: [], creator: '' });
const newMessage = ref('');
const replyingTo = ref(null);

const openCreateModal = () => {
  modal.isEdit = false;
  Object.assign(form, { title: '', desc: '', assignees: [], deadline: '', image: null, priority: 'Medium', comments: [], creator: currentUser.value });
  modal.show = true;
};

const editTask = (task) => {
  modal.isEdit = true;
  modal.id = task.id;
  Object.assign(form, JSON.parse(JSON.stringify(task)));
  modal.show = true;
};

const openChat = (task) => {
  editTask(task);
  nextTick(() => {
    const el = document.getElementById('chatSection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
};

const handleTaskSubmit = () => {
  if (!form.title) return;
  if (modal.isEdit) {
    if (form.creator !== currentUser.value) return; // Guard
    boardData.value.forEach(c => {
      const idx = c.tasks.findIndex(t => t.id === modal.id);
      if (idx !== -1) c.tasks[idx] = JSON.parse(JSON.stringify(form));
    });
  } else {
    boardData.value[0].tasks.unshift({ ...form, id: Date.now(), creator: currentUser.value });
  }
  modal.show = false;
};

const uploadImage = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => form.image = ev.target.result;
    reader.readAsDataURL(file);
  }
};

const sendComment = () => {
  if (!newMessage.value.trim()) return;
  const msg = {
    user: currentUser.value,
    text: newMessage.value,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    replyTo: replyingTo.value ? replyingTo.value.text : null
  };
  form.comments.push(msg);
  newMessage.value = '';
  replyingTo.value = null;
  
  // Real-time sync to the board task
  boardData.value.forEach(c => {
    const t = c.tasks.find(t => t.id === modal.id);
    if (t) t.comments = [...form.comments];
  });

  nextTick(() => {
    const el = document.getElementById('modalBodyScroll');
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  });
};

const setReply = (msg) => replyingTo.value = msg;

const confirmDelete = () => {
  if (confirm("Vazifani o'chirishni tasdiqlaysizmi?")) {
    boardData.value.forEach(c => c.tasks = c.tasks.filter(t => t.id !== modal.id));
    modal.show = false;
  }
};

const filteredTasks = (tasks) => tasks;
const getPriorityStyle = (p) => {
  const s = { Urgent: 'bg-rose-500 text-white', High: 'bg-amber-500 text-white', Medium: 'bg-indigo-500 text-white', Low: 'bg-emerald-500 text-white' };
  return s[p] || 'bg-slate-500';
};

const onDragStart = (e, task, colId) => {
  e.dataTransfer.setData('taskId', task.id);
  e.dataTransfer.setData('sourceColId', colId);
};

const onDrop = (e, destColId) => {
  const taskId = parseInt(e.dataTransfer.getData('taskId'));
  const sourceColId = parseInt(e.dataTransfer.getData('sourceColId'));
  if (sourceColId === destColId) return;
  const srcCol = boardData.value.find(c => c.id === sourceColId);
  const dstCol = boardData.value.find(c => c.id === destColId);
  const idx = srcCol.tasks.findIndex(t => t.id === taskId);
  if (idx !== -1) dstCol.tasks.push(srcCol.tasks.splice(idx, 1)[0]);
};

onMounted(() => document.documentElement.classList.add('dark'));
</script>

<style>
.custom-v-scroll::-webkit-scrollbar { width: 5px; }
.custom-v-scroll::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.scale-in { animation: scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.animate-slide-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>