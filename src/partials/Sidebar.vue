<template>
  <div class="z-[50]">
    <HeaderAnimatsion class="" :season="selectedAnimationTheme" />

    <div
  class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out dark:bg-black/60"
  :class="sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
  @click="handleSidebarClose"
  aria-hidden="true"
></div>

    <div
      id="sidebar"
      ref="sidebar"
      class="flex flex-col absolute z-60 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-20 2xl:sidebar-expanded:!w-64 shrink-0 bg-dash bg-indigo-50 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-400 p-4 transition-all duration-200 ease-in-out"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-64'"
    >
      <div
        class="transition-all duration-300 sticky top-0 z-40 mb-4 ml-[-9px]"
        :class="sidebarExpanded ? 'w-60' : 'w-16'"
      >
        <div
          class="flex items-center justify-between px-3 py-3 bg-white dark:bg-slate-700 backdrop-blur-md rounded-md shadow border border-white/10 w-full"
        >
          <div class="flex items-center gap-3">
            <HeaderAnimatsion class="" :season="selectedAnimationTheme" />

            <div
              class="flex items-center gap-3 w-full"
              :class="!sidebarExpanded ? 'justify-center' : ''"
            >
              <img
                src="../../public/safymilk_logo_4.jpg"
                alt="safy logo"
                class="rounded-full border dark:border-white border-slate-200 shadow object-cover cursor-pointer transition-all duration-300"
                :class="sidebarExpanded ? 'w-16 h-16' : 'w-10 h-10'"
                @click="handleSidebarClose"
              />

              <div v-if="sidebarExpanded" class="leading-tight">
                <h1
                  class="text-slate-600 dark:text-white text-xl font-sans tracking-wide font-bold mb-[0.5]"
                >
                  Safymilk
                </h1>
                <p
                  class="text-[10px] dark:text-slate-400 text-slate-500 font-sans tracking-wide font-medium"
                >
                  Raqamli boshqaruv — real yutuq.
                </p>
              </div>
            </div>
            <button
              v-if="sidebarExpanded"
              @click.prevent="sidebarExpanded = !sidebarExpanded"
              class="dark:text-white text-slate-600 transition text-lg hidden sm:inline"
            >
              <i class="fas fa-arrow-left"></i>
            </button>
          </div>
        </div>

        <div
          v-if="sidebarExpanded"
          class="flex items-center justify-between px-1 py-1 bg-white dark:bg-slate-700 backdrop-blur-md rounded-md shadow border border-white/10 w-full mt-1 gap-2"
        >
          <div class="flex items-center gap-2">
            <div
              @click="openEdoSidebar"
              class="inline-flex text-[11px] items-center px-1 py-1 font-medium text-center text-white bg-slate-300 rounded-[50%] text-bold cursor-pointer"
            >
              <img
                class="rounded-full w-[25px] h-[25px]"
                src="https://play-lh.googleusercontent.com/iG3OBZOG3jaX4h8CZOEOl_ZNHeMSC6_HFiQX63NdnhzgvzEDemi0eAXT5ng62ov7Ag"
                alt="EDO"
              />
            </div>
            <div
              @click="openChatSidebar"
              class="inline-flex text-[11px] items-center px-1 py-1 font-medium text-center text-white bg-slate-300 rounded-[50%] text-bold cursor-pointer"
            >
              <img
                width="24px"
                height="24px"
                src="https://static.tildacdn.com/tild6536-3666-4039-b131-666165613134/_2.png"
                alt="Telegram"
              />
            </div>
            <div
              class="inline-flex text-[11px] items-center px-1 py-1 font-medium text-center text-white bg-slate-300 rounded-[50%] text-bold cursor-pointer"
            >
              <a href="https://didox.uz" target="_blank">
                <img
                  src="https://aloqabusiness.uz/upload/iblock/b38/e2pseped973eqvb9pipop1yosmi6b1aw/logo_partner_didox.webp"
                  alt="DIDOX"
                  style="width: 24px; height: 24px; border-radius: 50%"
                />
              </a>
            </div>
            <div
              class="inline-flex text-[11px] items-center px-1 py-1 font-medium text-center text-white bg-slate-300 rounded-[50%] text-bold cursor-pointer"
            >
              <a href="#" target="_blank">
                <img
                  src="https://kassa.bifit.com/wiki/images/thumb/7/72/Product-1c.svg/2048px-Product-1c.svg.png"
                  alt="1C"
                  style="width: 24px; height: 24px; border-radius: 50%"
                />
              </a>
            </div>
            <div
              class="inline-flex text-[11px] items-center px-1 py-1 font-medium text-center text-white bg-slate-300 rounded-[50%] text-bold cursor-pointer"
            >
              <a href="https://click.uz/uz" target="_blank">
                <img
                  src="https://play-lh.googleusercontent.com/vinYJkoh5f-UTTHgiV2DZ9YssEEfk69esYFrasVirZ5Wfp_-da5ahAel63pY-Q2IMnc"
                  alt="CLICK"
                  style="width: 24px; height: 24px; border-radius: 50%"
                />
              </a>
            </div>
          </div>
          <div>
            <i
              @click="removeFile"
              class="fa-solid fa-xmark mr-2 fa-sm text-red-500 cursor-pointer"
            ></i>
          </div>
        </div>
      </div>

      <div class="space-y-5">
        <div>
          <h3
            @click="is_dashboard = !is_dashboard"
            class="text-xs uppercase text-slate-500 dark:text-white font-semibold ml-[-9px] mr-[-9px]"
          >
            <div
              class="flex justify-between bg-white dark:bg-slate-700 p-2 rounded w-full cursor-pointer"
            >
              <span
                class="lg:hidden lg:sidebar-expanded:block 2xl:sidebar-expanded:block 2xl:hidden"
                >Dashboard</span
              >
              <i
                v-if="is_dashboard"
                class="fa-solid fa-angle-up fa-sm mt-2"
              ></i>
              <i v-else class="fa-solid fa-angle-down fa-sm mt-2"></i>
            </div>
          </h3>

          <div
            v-if="is_dashboard === true"
            class="p-2.5 mt-1 rounded-lg border bg-white border-slate-200 dark:border-slate-600 dark:bg-slate-700 shadow-md transition"
          >
            <ul>
              <SidebarLinkGroup
                v-slot="parentLink"
                :activeCondition="currentRoute.fullPath.includes('ecommerce')"
              >
                <a
                  class="block text-slate-200 truncate transition duration-150"
                  :class="
                    currentRoute.fullPath.includes('ecommerce')
                      ? 'hover:text-slate-500'
                      : 'hover:text-white'
                  "
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i
                        class="fa-solid fa-chart-line text-indigo-400 text-lg"
                      ></i>
                      <span
                        class="text-sm font-medium ml-3 text-slate-500 dark:text-white truncate max-w-[150px]"
                        >Statistika</span
                      >
                    </div>
                    <svg
                      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                      :class="parentLink.expanded && 'rotate-180'"
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </a>
                <ul
                  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                  :class="!parentLink.expanded && 'hidden'"
                >
                  <li>
                    <router-link
                      :to="{ name: 'StatisticSale' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <i class="fa-solid fa-chart-pie text-indigo-400"></i>
                      <span class="text-[13px] font-medium"
                        >Sotuv statistikasi</span
                      >
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      to=""
                      active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <i class="fa-solid fa-warehouse text-indigo-400"></i>
                      <span class="text-[13px] font-medium"
                        >Ombor zaxirasi</span
                      >
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      to=""
                      active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <i class="fa-solid fa-industry text-indigo-400"></i>
                      <span class="text-[13px] font-medium"
                        >Ishlab chiqarish hajmi</span
                      >
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      to=""
                      active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <i class="fa-solid fa-user-clock text-indigo-400"></i>
                      <span class="text-[13px] font-medium"
                        >Ishchilar samaradorligi</span
                      >
                    </router-link>
                  </li>
                </ul>
              </SidebarLinkGroup>
            </ul>
          </div>
        </div>

        <div>
          <h3
            @click="is_production = !is_production"
            class="text-xs uppercase text-slate-500 dark:text-white font-semibold ml-[-9px] mr-[-9px]"
          >
            <span
              class="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
              aria-hidden="true"
              >•••</span
            >
            <div
              class="flex justify-between bg-white dark:bg-slate-700 p-2 rounded w-full cursor-pointer"
            >
              <span
                class="lg:hidden lg:sidebar-expanded:block 2xl:sidebar-expanded:block 2xl:hidden"
                >Ishlab chiqarish</span
              >
              <i
                v-if="is_production"
                class="fa-solid fa-angle-up fa-sm mt-2"
              ></i>
              <i v-else class="fa-solid fa-angle-down fa-sm mt-2"></i>
            </div>
          </h3>

          <div
            v-if="is_production === true"
            class="p-2.5 mt-1 rounded-lg border bg-white border-slate-200 dark:border-slate-600 dark:bg-slate-700 shadow-md transition"
          >
            <ul>
              <SidebarLinkGroup v-slot="parentLink">
                <a
                  class="block text-slate-200 truncate transition duration-150 hover:text-white"
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i class="fa-solid fa-water text-indigo-400 text-lg"></i>
                      <span
                        class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                        >Suv tozalash</span
                      >
                    </div>
                    <svg
                      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                      :class="parentLink.expanded && 'rotate-180'"
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </a>
                <ul
                  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                  :class="!parentLink.expanded && 'hidden'"
                >
                  <li>
                    <router-link
                      :to="{ name: 'Employees' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium">Xodimlar</span>
                    </router-link>
                  </li>
                </ul>
              </SidebarLinkGroup>
            </ul>

            <ul >
              <SidebarLinkGroup v-slot="parentLink">
                <a
                  class="block text-slate-200 truncate transition duration-150 hover:text-white"
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i
                        class="fa-solid fa-bottle-water text-indigo-400 text-lg"
                      ></i>
                      <span
                        class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                        >Idish to'ldirish</span
                      >
                    </div>
                    <svg
                      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                      :class="parentLink.expanded && 'rotate-180'"
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </a>
                <ul
                  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                  :class="!parentLink.expanded && 'hidden'"
                >
                  <li>
                    <router-link
                      :to="{ name: 'Employees' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium">Xodimlar</span>
                    </router-link>
                  </li>
                </ul>
              </SidebarLinkGroup>
            </ul>

            <ul >
              <SidebarLinkGroup v-slot="parentLink">
                <a
                  class="block text-slate-200 truncate transition duration-150 hover:text-white"
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i
                        class="fa-solid fa-box-open text-indigo-400 text-lg"
                      ></i>
                      <span
                        class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                        >Qadoqlash</span
                      >
                    </div>
                    <svg
                      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                      :class="parentLink.expanded && 'rotate-180'"
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </a>
                <ul
                  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                  :class="!parentLink.expanded && 'hidden'"
                >
                  <li>
                    <router-link
                      :to="{ name: 'Orders' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium">Buyurtmalar</span>
                    </router-link>
                  </li>
                </ul>
              </SidebarLinkGroup>
            </ul>

            <ul >
              <SidebarLinkGroup v-slot="parentLink">
                <a
                  class="block text-slate-200 truncate transition duration-150 hover:text-white"
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i
                        class="fa-solid fa-clipboard-check text-indigo-400 text-lg"
                      ></i>
                      <span
                        class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                        >Sifat nazorati</span
                      >
                    </div>
                    <svg
                      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                      :class="parentLink.expanded && 'rotate-180'"
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </a>
                <ul
                  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                  :class="!parentLink.expanded && 'hidden'"
                >
                  <li>
                    <router-link
                      :to="{ name: 'Orders' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium"
                        >Laboratoriya natijalari</span
                      >
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      :to="{ name: 'Orders' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium"
                        >Qayta ishlashga yuborilganlari</span
                      >
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      :to="{ name: 'Orders' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium"
                        >Rad etilgan partiyalar</span
                      >
                    </router-link>
                  </li>
                </ul>
              </SidebarLinkGroup>
            </ul>
          </div>
        </div>

        <div>
          <h3
            @click="is_departments = !is_departments"
            class="text-xs uppercase text-slate-500 dark:text-white font-semibold ml-[-9px] mr-[-9px]"
          >
            <span
              class="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
              aria-hidden="true"
              >•••</span
            >
            <div
              class="flex justify-between bg-white dark:bg-slate-700 p-2 rounded w-full cursor-pointer"
            >
              <span
                class="lg:hidden lg:sidebar-expanded:block 2xl:sidebar-expanded:block 2xl:hidden"
                >Bo'limlar</span
              >
              <i
                v-if="is_departments"
                class="fa-solid fa-angle-up fa-sm mt-2"
              ></i>
              <i v-else class="fa-solid fa-angle-down fa-sm mt-2"></i>
            </div>
          </h3>

          <div
            v-if="is_departments === true"
            class="p-2.5 mt-1 rounded-lg border bg-white border-slate-200 dark:border-slate-600 dark:bg-slate-700 shadow-md transition"
          >
            <Guard :roles="['30', '1000', '2000']">
              <ul class="">
                <SidebarLinkGroup v-slot="parentLink">
                  <a
                    class="block text-slate-200 truncate transition duration-150 hover:text-white"
                    href="#0"
                    @click.prevent="
                      sidebarExpanded
                        ? parentLink.handleClick()
                        : (sidebarExpanded = true)
                    "
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <i
                          class="fa-solid fa-calculator text-indigo-400 text-lg"
                        ></i>
                        <span
                          class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                          >Buxgalteriya</span
                        >
                      </div>
                      <svg
                        class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                        :class="parentLink.expanded && 'rotate-180'"
                        viewBox="0 0 12 12"
                      >
                        <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                      </svg>
                    </div>
                  </a>
                  <ul
                    class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                    :class="!parentLink.expanded && 'hidden'"
                  >
                    <li>
                      <router-link
                        :to="{ name: 'Employees' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium"
                          >Hisobvaraqlar reestri</span
                        >
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        :to="{ name: 'Employees' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium"
                          >Kassa operatsiyalari</span
                        >
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        :to="{ name: 'Employees' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium"
                          >Debit/Kredit</span
                        >
                      </router-link>
                    </li>
                  </ul>
                </SidebarLinkGroup>
              </ul>
            </Guard>
            <Guard :roles="['30', '1000', '2000']">
              <ul >
                <SidebarLinkGroup v-slot="parentLink">
                  <a
                    class="block text-slate-200 truncate transition duration-150 hover:text-white"
                    href="#0"
                    @click.prevent="
                      sidebarExpanded
                        ? parentLink.handleClick()
                        : (sidebarExpanded = true)
                    "
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <i
                          class="fa-solid fa-user-tie text-indigo-400 text-lg"
                        ></i>
                        <span
                          class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                          >Kadrlar</span
                        >
                      </div>
                      <svg
                        class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                        :class="parentLink.expanded && 'rotate-180'"
                        viewBox="0 0 12 12"
                      >
                        <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                      </svg>
                    </div>
                  </a>
                  <ul
                    class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                    :class="!parentLink.expanded && 'hidden'"
                  >
                    <li>
                      <router-link
                        :to="{ name: 'Employees' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium"
                          >Xodimlar ro'yxati</span
                        >
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        :to="{ name: 'Employees' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium"
                          >Ish haqi va bonuslar</span
                        >
                      </router-link>
                    </li>
                  </ul>
                </SidebarLinkGroup>
              </ul>
            </Guard>
            <Guard :roles="['20','1000','2000']">
              <ul >
                <SidebarLinkGroup v-slot="parentLink">
                  <a
                    class="block text-slate-200 truncate transition duration-150 hover:text-white"
                    href="#0"
                    @click.prevent="
                      sidebarExpanded
                        ? parentLink.handleClick()
                        : (sidebarExpanded = true)
                    "
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <i
                          class="fa-solid fa-cart-shopping text-indigo-400 text-lg"
                        ></i>
                        <span
                          class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                          >Sotuv</span
                        >
                      </div>
                      <svg
                        class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                        :class="parentLink.expanded && 'rotate-180'"
                        viewBox="0 0 12 12"
                      >
                        <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                      </svg>
                    </div>
                  </a>
                  <ul
                    class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                    :class="!parentLink.expanded && 'hidden'"
                  >
                    <li>
                      <router-link
                        :to="{ name: 'Sotuv (POS)' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium">Sotuv (POS)</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        :to="{ name: 'Sotuvlar' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium"
                          >Sotuv ro'yxati</span
                        >
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        :to="{ name: 'Products' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium"
                          >Mahsulotlar ro'yxati</span
                        >
                      </router-link>
                    </li>
                  </ul>
                </SidebarLinkGroup>
              </ul>
            </Guard>
            <Guard :roles="['40', '1000', '2000']">
              <ul >
                <SidebarLinkGroup v-slot="parentLink">
                  <a
                    class="block text-slate-200 truncate transition duration-150 hover:text-white"
                    href="#0"
                    @click.prevent="
                      sidebarExpanded
                        ? parentLink.handleClick()
                        : (sidebarExpanded = true)
                    "
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <i
                          class="fa-solid fa-warehouse text-indigo-400 text-lg"
                        ></i>
                        <span
                          class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                          >Omborlar</span
                        >
                      </div>
                      <svg
                        class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                        :class="parentLink.expanded && 'rotate-180'"
                        viewBox="0 0 12 12"
                      >
                        <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                      </svg>
                    </div>
                  </a>
                  <ul
                    class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                    :class="!parentLink.expanded && 'hidden'"
                  >
                    <li>
                      <router-link
                        :to="{ name: 'Kirim qilish' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium"
                          >Kirim qilish</span
                        >
                      </router-link>
                    </li>

                    <li>
                      <router-link
                        :to="{ name: 'ReadyWarehouse' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium"
                          >Kirm ro'yxati</span
                        >
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        :to="{ name: 'Products' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium">Qoldiq</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        :to="{ name: 'Rivizya' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium">Riviziya</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        :to="{ name: 'ReadyWarehouse' }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium"
                          >Xom ashyo (ombori)</span
                        >
                      </router-link>
                    </li>
                  </ul>
                </SidebarLinkGroup>
              </ul>
            </Guard>

            <ul >
              <SidebarLinkGroup v-slot="parentLink">
                <a
                  class="block text-slate-200 truncate transition duration-150 hover:text-white"
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i
                        class="fa-solid fa-person-circle-question text-indigo-400 text-lg"
                      ></i>
                      <span
                        class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                        >Mijozlar</span
                      >
                    </div>
                    <svg
                      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                      :class="parentLink.expanded && 'rotate-180'"
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </a>
                <ul
                  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                  :class="!parentLink.expanded && 'hidden'"
                >
                  <li>
                    <router-link
                      :to="{ name: `Mijozlar ro'yxati` }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium"
                        >Mijozlar ro'yxati</span
                      >
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      :to="{ name: 'Monitoring' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium"
                        >Kontragentlar ro'yxati</span
                      >
                    </router-link>
                  </li>
                </ul>
              </SidebarLinkGroup>
            </ul>
                <ul >
              <SidebarLinkGroup v-slot="parentLink">
             <a
  class="block text-slate-200 transition duration-150 hover:text-white overflow-hidden"
  href="#0"
  @click.prevent="sidebarExpanded ? parentLink.handleClick() : (sidebarExpanded = true)"
>
  <div class="flex items-center justify-between">
    <div class="flex items-center overflow-hidden flex-1">
      <i class="fa-solid fa-boxes-packing text-indigo-400 text-lg shrink-0"></i>
      
      <div class="ml-3 overflow-hidden flex-1 relative group-hover:cursor-pointer">
        <span
          class="marquee-text inline-block whitespace-nowrap text-sm font-medium text-slate-500 dark:text-white"
        >
          Ta'minot 
        </span>
      </div>
    </div>

    <svg
      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
      :class="parentLink.expanded && 'rotate-180'"
      viewBox="0 0 12 12"
    >
      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
    </svg>
  </div>
</a>
              <ul
  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
  :class="!parentLink.expanded && 'hidden'"
>
  <SidebarSubGroup>
    <template #title>Xomashyo</template>
    <template #content>
      <li>
        <router-link
          :to="{ name: 'Kirim' }"
          active-class="active-link"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
        >
          <span class="text-[12px] font-medium">Kirim qilish</span>
        </router-link>
      </li>
      <li>
        <router-link
          :to="{ name: 'Kirim ro\'yxati' }"
          active-class="active-link"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
        >
          <span class="text-[12px] font-medium">Kirim ro'yxati</span>
        </router-link>
      </li>
      <li>
        <router-link
          :to="{ name: 'Xomashyo' }"
          active-class="active-link"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
        >
          <span class="text-[12px] font-medium">Xomashyo ro'yxati</span>
        </router-link>
      </li>
    </template>
  </SidebarSubGroup>

  <SidebarSubGroup>
    <template #title>Aksesuarlar</template>
    <template #content>
      <li>
        <router-link
          :to="{ name: 'Aksesuarlar' }" 
          active-class="active-link"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
        >
          <span class="text-[12px] font-medium">Aksesuarlar ro'yxati</span>
        </router-link>
      </li>
      <li>
        <router-link
          :to="{ name: 'Mijozlar ro\'yxati' }"
          active-class="active-link"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
        >
          <span class="text-[12px] font-medium">Qaytarish</span>
        </router-link>
      </li>
    </template>
  </SidebarSubGroup>

  <li class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
    <router-link
      :to="{ name: 'Kontragentlar' }"
      active-class="active-link"
      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
    >
      <i class="fa-solid fa-address-book text-[14px]"></i>
      <span class="text-[13px] font-semibold">Kontragentlar</span>
    </router-link>
  </li>
</ul>
              </SidebarLinkGroup>
            </ul>
              <ul >
              <SidebarLinkGroup v-slot="parentLink">
                <a
                  class="block text-slate-200 truncate transition duration-150 hover:text-white"
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i
                        class="fa-solid fa-flask-vial text-indigo-400 text-lg"
                      ></i>
                      <span
                        class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                        >Laboratoriya</span
                      >
                    </div>
                    <svg
                      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                      :class="parentLink.expanded && 'rotate-180'"
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </a>
                <ul
                  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                  :class="!parentLink.expanded && 'hidden'"
                >
                  <li>
                    <router-link
                      :to="{ name: `Kirim ro'yxati` }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium"
                        >Kirim analizi (Xomashyo)</span
                      >
                    </router-link>
                  </li>
                  
                   <li>
                    <router-link
                      :to="{ name: `Mijozlar ro'yxati` }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium"
                        >Tayyor mahsulot xulosasi</span
                      >
                    </router-link>
                  </li>
                  
                </ul>
              </SidebarLinkGroup>
            </ul>
         <ul >
  <SidebarLinkGroup v-slot="parentLink">
    <a
      class="block text-slate-200 truncate transition duration-150 hover:text-white"
      href="#0"
      @click.prevent="sidebarExpanded ? parentLink.handleClick() : (sidebarExpanded = true)"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <i class="fa-solid fa-chart-line text-indigo-400 text-lg"></i>
          <span class="text-sm font-medium ml-3 text-slate-500 dark:text-white">Reja iqtisod</span>
        </div>
        <svg
          class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
          :class="parentLink.expanded && 'rotate-180'"
          viewBox="0 0 12 12"
        >
          <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
        </svg>
      </div>
    </a>
    
    <ul
      class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
      :class="!parentLink.expanded && 'hidden'"
    >
      <li>
        <router-link
          to="{ name: 'InboundAnalysis' }"
          active-class="active-link"
          class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
        >
          <span class="text-[13px] font-medium">Kiruvchi partyalar</span>
        </router-link>
      </li>

      <li>
        <router-link
          to="{ name: 'CostCalculation' }"
          active-class="active-link"
          class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
        >
          <span class="text-[13px] font-medium">Mahsulot kalkulyatsiyasi</span>
        </router-link>
      </li>

      <li>
        <router-link
          to="{ name: 'ProductionControl' }"
          active-class="active-link"
          class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
        >
          <span class="text-[13px] font-medium">Sexlararo hisoboti</span>
        </router-link>
      </li>

      <li>
        <router-link
          to="{ name: 'LossReport' }"
          active-class="active-link"
          class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
        >
          <span class="text-[13px] font-medium"></span>
        </router-link>
      </li>
    </ul>
  </SidebarLinkGroup>
</ul>
            <ul >
              <SidebarLinkGroup v-slot="parentLink">
                <a
                  class="block text-slate-200 truncate transition duration-150 hover:text-white"
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i
                        class="fa-solid fa-truck-fast text-indigo-400 text-lg"
                      ></i>
                      <span
                        class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                        >Logistika</span
                      >
                    </div>
                    <svg
                      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                      :class="parentLink.expanded && 'rotate-180'"
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </a>
                <ul
                  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                  :class="!parentLink.expanded && 'hidden'"
                >
                  <li>
                    <router-link
                      :to="{ name: 'Monitoring' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium">GPS nazorati</span>
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      :to="{ name: 'Monitoring' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium">Haydovchilar</span>
                    </router-link>
                  </li>
                </ul>
              </SidebarLinkGroup>
            </ul>
             <ul >
              <SidebarLinkGroup v-slot="parentLink">
                <a
                  class="block text-slate-200 truncate transition duration-150 hover:text-white"
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i
                        class="fa-solid fa-info-circle text-indigo-400 text-lg"
                      ></i>
                      <span
                        class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                        >Ma'lumot uchun</span
                      >
                    </div>
                    <svg
                      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                      :class="parentLink.expanded && 'rotate-180'"
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </a>
                <ul
                  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                  :class="!parentLink.expanded && 'hidden'"
                >
                 <li>
                    <router-link
                      :to="{ name: 'Yorliq' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium">Yorliq</span>
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      :to="{ name: 'Monitoring' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium">Kategorya ro'yxati</span>
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      :to="{ name: 'Monitoring' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium">Birlik ro'yxati</span>
                    </router-link>
                  </li>
                   <li>
                    <router-link
                      :to="{ name: 'Monitoring' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium">Ombor ro'yxati</span>
                    </router-link>
                  </li>
                   <li>
                    <router-link
                      :to="{ name: 'Monitoring' }"
                       active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium">Asosiy vosita ro'yxati</span>
                    </router-link>
                  </li>
                </ul>
              </SidebarLinkGroup>
            </ul>
          </div>
        </div>

        <div>
          <h3
            @click="is_reports = !is_reports"
            class="text-xs uppercase text-slate-500 dark:text-white font-semibold ml-[-9px] mr-[-9px]"
          >
            <span
              class="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
              aria-hidden="true"
              >•••</span
            >
            <div
              class="flex justify-between bg-white dark:bg-slate-700 p-2 rounded w-full cursor-pointer"
            >
              <span
                class="lg:hidden lg:sidebar-expanded:block 2xl:sidebar-expanded:block 2xl:hidden"
                >Hisobotlar</span
              >
              <i v-if="is_reports" class="fa-solid fa-angle-up fa-sm mt-2"></i>
              <i v-else class="fa-solid fa-angle-down fa-sm mt-2"></i>
            </div>
          </h3>

          <div
            v-if="is_reports === true"
            class="p-2.5 mt-1 rounded-lg border bg-white border-slate-200 dark:border-slate-600 dark:bg-slate-700 shadow-md transition"
          >
            <ul >
              <SidebarLinkGroup v-slot="parentLink">
                <a
                  class="block text-slate-200 truncate transition duration-150 hover:text-white"
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i
                        class="fa-solid fa-file-invoice text-indigo-400 text-lg"
                      ></i>
                      <span
                        class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                        >Buhgalteriya hisoboti</span
                      >
                    </div>
                    <svg
                      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                      :class="parentLink.expanded && 'rotate-180'"
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </a>
                <ul
                  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                  :class="!parentLink.expanded && 'hidden'"
                >
                  <li>
                    <router-link
                      to="#"
                      active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium"
                        >Batafsil ko'rish</span
                      >
                    </router-link>
                  </li>
                </ul>
              </SidebarLinkGroup>
            </ul>

            <ul >
              <SidebarLinkGroup v-slot="parentLink">
                <a
                  class="block text-slate-200 truncate transition duration-150 hover:text-white"
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i
                        class="fa-solid fa-users-viewfinder text-indigo-400 text-lg"
                      ></i>
                      <span
                        class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                        >Kadrlar hisoboti</span
                      >
                    </div>
                    <svg
                      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                      :class="parentLink.expanded && 'rotate-180'"
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </a>
                <ul
                  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                  :class="!parentLink.expanded && 'hidden'"
                >
                  <li>
                    <router-link
                      to="#"
                      active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <span class="text-[13px] font-medium"
                        >Batafsil ko'rish</span
                      >
                    </router-link>
                  </li>
                </ul>
              </SidebarLinkGroup>
            </ul>
          </div>
        </div>
        <Guard :roles="['1000']">
          <div>
            <h3
              @click="is_settings = !is_settings"
              class="text-xs uppercase text-slate-500 dark:text-white font-semibold ml-[-9px] mr-[-9px]"
            >
              <span
                class="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
                aria-hidden="true"
                >•••</span
              >
              <div
                class="flex justify-between bg-white dark:bg-slate-700 p-2 rounded w-full cursor-pointer"
              >
                <span
                  class="lg:hidden lg:sidebar-expanded:block 2xl:sidebar-expanded:block 2xl:hidden"
                  >Sozlamalar</span
                >
                <i
                  v-if="is_settings"
                  class="fa-solid fa-angle-up fa-sm mt-2"
                ></i>
                <i v-else class="fa-solid fa-angle-down fa-sm mt-2"></i>
              </div>
            </h3>

            <div
              v-if="is_settings === true"
              class="p-2.5 mt-1 rounded-lg border bg-white border-slate-200 dark:border-slate-600 dark:bg-slate-700 shadow-md transition"
            >
              <ul class="">
                <SidebarLinkGroup v-slot="parentLink">
                  <a
                    class="block text-slate-200 truncate transition duration-150 hover:text-white"
                    href="#0"
                    @click.prevent="
                      sidebarExpanded
                        ? parentLink.handleClick()
                        : (sidebarExpanded = true)
                    "
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <i class="fa-solid fa-gear text-indigo-400 text-lg"></i>
                        <span
                          class="text-sm font-medium ml-3 text-slate-500 dark:text-white"
                          >Tizim sozlamalari</span
                        >
                      </div>
                      <svg
                        class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                        :class="parentLink.expanded && 'rotate-180'"
                        viewBox="0 0 12 12"
                      >
                        <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                      </svg>
                    </div>
                  </a>
                  <ul
                    class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                    :class="!parentLink.expanded && 'hidden'"
                  >
                    <li>
                      <router-link
                        :to="{ name: `Foydalanuvchilar` }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium"
                          >Foydalanuvchilar</span
                        >
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        :to="{ name: `Foydalanuvchilar` }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium">Bo'limlar</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link
                        :to="{ name: `Rollar boshqaruvi` }"
                         active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <span class="text-[13px] font-medium"
                          >Ruxsatlar boshqaruvi</span
                        >
                      </router-link>
                    </li>
                  </ul>
                </SidebarLinkGroup>
              </ul>
            </div>
          </div>
        </Guard>
        <!-- More group -->
        <div>
          <h3
            @click="is_mores = !is_mores"
            class="text-xs uppercase text-slate-500 dark:text-white font-semibold ml-[-9px] mr-[-9px]"
          >
            <span
              class="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
              aria-hidden="true"
              >•••</span
            >
            <div
              class="flex justify-between bg-white dark:bg-slate-700 p-2 rounded w-full cursor-pointer"
            >
              <span
                class="lg:hidden lg:sidebar-expanded:block 2xl:sidebar-expanded:block 2xl:hidden"
                >Boshqalar
              </span>
              <i
                v-if="is_mores === true"
                class="fa-solid fa-angle-up fa-sm mt-2"
              ></i>
              <i
                v-if="is_mores === false"
                class="fa-solid fa-angle-down fa-sm mt-2"
              ></i>
            </div>
          </h3>
          <!-- 🔐 Authentication -->
          <div
            v-if="is_mores === true"
            class="p-2.5 mt-1 rounded-lg border bg-white border-slate-200 dark:border-slate-600 dark:bg-slate-700 shadow-md transition"
          >
            <ul class="">
              <SidebarLinkGroup
                v-slot="parentLink"
                :activeCondition="currentRoute.fullPath.includes('auth')"
              >
                <a
                  class="block text-slate-200 truncate transition duration-150"
                  :class="
                    currentRoute.fullPath.includes('auth')
                      ? 'hover:text-slate-500'
                      : 'hover:text-white'
                  "
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i
                        class="fa-solid fa-user-lock text-indigo-400 text-lg"
                      ></i>
                      <span
                        class="text-sm font-medium ml-3 text-slate-500 dark:text-white truncate max-w-[150px]"
                        title="Foydalanuvchi autentifikatsiyasi"
                      >
                        Authentication
                      </span>
                    </div>

                    <!-- Arrow -->
                    <svg
                      class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 transition-transform duration-300"
                      :class="parentLink.expanded && 'rotate-180'"
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </a>

                <!-- Ichki menyu -->
                <ul
                  class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                  :class="!parentLink.expanded && 'hidden'"
                >
                  <!-- 1️⃣ Sign in -->
                  <li>
                    <router-link
                      to="/signin"
                      active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <i
                        class="fa-solid fa-right-to-bracket text-indigo-400"
                      ></i>
                      <span class="text-[13px] font-medium"
                        >Tizimga kirish</span
                      >
                    </router-link>
                  </li>

                  <!-- 2️⃣ Sign up -->
                  <li>
                    <router-link
                      to="/signup"
                      active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <i class="fa-solid fa-user-plus text-indigo-400"></i>
                      <span class="text-[13px] font-medium"
                        >Ro‘yxatdan o‘tish</span
                      >
                    </router-link>
                  </li>

                  <!-- 3️⃣ Reset Password -->
                  <li>
                    <router-link
                      to="/reset-password"
                      active-class="active-link"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                    >
                      <i class="fa-solid fa-key text-indigo-400"></i>
                      <span class="text-[13px] font-medium"
                        >Parolni tiklash</span
                      >
                    </router-link>
                  </li>
                </ul>
              </SidebarLinkGroup>
            </ul>
          </div>

          <div
            v-if="is_mores === true"
            class="p-2.5 mt-1 rounded-lg border bg-white border-slate-200 dark:border-slate-600 dark:bg-slate-700 shadow-md transition"
          >
            <ul class="">
              <!--  Yordam va qo‘llanmalar  -->
              <SidebarLinkGroup v-slot="parentLink">
                <a
                  class="block text-slate-200 truncate transition duration-150"
                  :class="
                    parentLink.expanded
                      ? 'hover:text-slate-500'
                      : 'hover:text-white'
                  "
                  href="#0"
                  @click.prevent="
                    sidebarExpanded
                      ? parentLink.handleClick()
                      : (sidebarExpanded = true)
                  "
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <i class="fas fa-circle-info text-indigo-400 text-xl"></i>

                      <span
                        class="text-sm font-medium ml-3 lg:opacity-0 2xl:opacity-0 lg:sidebar-expanded:opacity-100 duration-200 text-slate-500 dark:text-white"
                      >
                        Yordam va qo‘llanmalar</span
                      >
                    </div>
                    <!-- Icon -->
                    <div class="flex shrink-0 ml-2">
                      <svg
                        class="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400"
                        :class="parentLink.expanded && 'rotate-180'"
                        viewBox="0 0 12 12"
                      >
                        <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                      </svg>
                    </div>
                  </div>
                </a>
                <div
                  class="lg:hidden lg:sidebar-expanded:block 2xl:sidebar-expanded:block 2xl:hidden"
                >
                  <!-- Ichki menyu -->
                  <ul
                    class="pl-5 mt-2 space-y-1 border-l border-indigo-200 dark:border-indigo-400 transition-all duration-500 ease-in-out"
                    :class="!parentLink.expanded && 'hidden'"
                  >
                    <!-- 1️⃣ Foydalanish bo‘yicha yo‘riqnomalar -->
                    <li>
                      <router-link
                        to=""
                        active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <i class="fa-solid fa-book-open text-indigo-400"></i>
                        <span class="text-[13px] font-medium">
                          Yo‘riqnomalar va video darslar
                        </span>
                      </router-link>
                    </li>

                    <!-- 2️⃣ Savol-javoblar (FAQ) -->
                    <li>
                      <router-link
                        to=""
                        active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <i
                          class="fa-solid fa-circle-question text-indigo-400"
                        ></i>
                        <span class="text-[13px] font-medium">
                          Savol-javoblar (FAQ)
                        </span>
                      </router-link>
                    </li>

                    <!-- 3️⃣ Texnik yordam -->
                    <li>
                      <router-link
                        to=""
                        active-class="active-link"
                        class="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <i class="fa-solid fa-headset text-indigo-400"></i>
                        <span class="text-[13px] font-medium">
                          Texnik yordam (Support)
                        </span>
                      </router-link>
                    </li>
                  </ul>
                </div>
              </SidebarLinkGroup>
            </ul>
          </div>
        </div>
      </div>

      <div class="pt-3 hidden lg:inline-flex justify-end mt-auto">
        <div class="px-3 py-2">
          <button @click.prevent="sidebarExpanded = !sidebarExpanded">
            <span class="sr-only">Expand / collapse sidebar</span>
            <svg
              class="w-6 h-6 fill-current sidebar-expanded:rotate-180"
              viewBox="0 0 24 24"
            >
              <path
                class="text-slate-400"
                d="M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z"
              />
              <path class="text-slate-600" d="M3 23H1V1h2z" />
            </svg>
          </button>
        </div>
      </div>

      <div
        :class="sidebarExpanded ? 'w-60 px-4' : 'hidden'"
        class="sticky bottom-0 z-50 w-full py-2 bordered border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-md shadow-sm transition-all duration-300 ease-in-out"
      >
        <div
          class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
        >
          <span class="font-medium tracking-wide">safymilk</span>
          <span
            class="font-semibold text-[11px] text-slate-700 dark:text-slate-200"
            >v1.0.0</span
          >
        </div>
      </div>

      <div
        :class="
          sidebarExpanded
            ? 'w-60 px-3'
            : 'w-16 px-1 text-center items-center mr-4'
        "
        class="sticky bottom-0 z-50 w-full px-3 py-2 border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md"
      >
        <div
          class="flex items-center justify-between dark:text-white text-slate-600"
        >
          <div class="flex items-center gap-3">
            <div
              :class="{ 'ml-[-8px]': !sidebarExpanded }"
              class="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-500 shadow cursor-pointer"
            >
              <i class="fa-solid fa-headset text-white text-lg"></i>
            </div>
            <div v-if="sidebarExpanded">
              <p class="text-[11px] font-semibold opacity-80">Aloqa markazi</p>
              <a
                href="tel:+998930043936"
                class="text-[11px] font-semibold opacity-80 text-indigo-500 hover:underline"
              >
                +998 93 004 39 36
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import SidebarLinkGroup from "./SidebarLinkGroup.vue";
import HeaderAnimatsion from "./Settings/HeaderAnimatsion.vue";
import Guard from "../Guard/AppGuard.vue";
import SidebarSubGroup from "./SidebarSubGroup.vue";

export default {
  name: "Sidebar",
  props: ["sidebarOpen"],
  components: {
    SidebarLinkGroup,
    SidebarSubGroup,
    HeaderAnimatsion,
    Guard,
  },
  emits: ["close-sidebar"],
  setup(props, { emit }) {
    // --- Refs ---
    const trigger = ref(null);
    const sidebar = ref(null);
    // Menu States (EcoWater bo'limlari)
    const is_dashboard = ref(false);
    const is_production = ref(false);
    const is_reports = ref(false);
    const is_departments = ref(false);
    const is_mores = ref(false);
    const is_settings = ref(false);

    // Cookie logic
    const role = ref(JSON.parse(localStorage.getItem("account") || "{}").role);

    // --- Sidebar expanded state from localStorage ---
    const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
    const sidebarExpanded = ref(
      storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
    );

    const currentRoute = useRouter().currentRoute.value;

    // --- Click outside to close sidebar ---
    const clickHandler = ({ target }) => {
      if (!sidebar.value || !trigger.value) return;
      if (
        !props.sidebarOpen ||
        sidebar.value.contains(target) ||
        trigger.value.contains(target)
      )
        return;
      emit("close-sidebar");
    };
    // --- ESC key to close sidebar ---
    const keyHandler = ({ keyCode }) => {
      if (!props.sidebarOpen || keyCode !== 27) return;
      emit("close-sidebar");
    };

    // --- Responsive resize handler ---
    const resizeHandler = () => {
      const width = window.innerWidth;
      if ((width < 1024 || width >= 1536) && props.sidebarOpen) {
        emit("close-sidebar");
      }
    };
    const defaultAnimation = "0";

    const selectedAnimationTheme = ref(
      localStorage.getItem("animation") || defaultAnimation
    );

    setInterval(() => {
      const newValue = localStorage.getItem("animation") || defaultAnimation;
      if (selectedAnimationTheme.value !== newValue) {
        selectedAnimationTheme.value = newValue;
      }
    }, 500);

    onMounted(() => {
      document.addEventListener("click", clickHandler);
      document.addEventListener("keydown", keyHandler);
      window.addEventListener("resize", resizeHandler);
      resizeHandler();

      const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
      sidebarExpanded.value =
        storedSidebarExpanded === null
          ? true
          : storedSidebarExpanded === "false";
    });

    onUnmounted(() => {
      document.removeEventListener("click", clickHandler);
      document.removeEventListener("keydown", keyHandler);
      window.removeEventListener("resize", resizeHandler);
    });

    watch(sidebarExpanded, () => {
      localStorage.setItem("sidebar-expanded", sidebarExpanded.value);
      if (sidebarExpanded.value) {
        document.querySelector("body").classList.add("sidebar-expanded");
      } else {
        document.querySelector("body").classList.remove("sidebar-expanded");
      }
    });

    const handleSidebarClose = () => {
      sidebarExpanded.value = true;
      emit("close-sidebar");
    };

    const openEdoSidebar = () => {
      window.dispatchEvent(new Event("toggle-edo-sidebar"));
    };

    const openChatSidebar = () => {
      window.dispatchEvent(new Event("toggle-chat-sidebar"));
    };

    return {
      role,
      trigger,
      sidebar,
      sidebarExpanded,
      currentRoute,
      is_dashboard,
      is_production,
      is_reports,
      is_departments,
      is_settings,
      is_mores,
      handleSidebarClose,
      openEdoSidebar,
      openChatSidebar,
      selectedAnimationTheme,
    };
  },
};
</script>

<style scoped>
/* 1. Asosiy Aktiv Link Konteyneri */


/* 5. Pulsatsiya animatsiyasi (Indikator uchun) */
@keyframes pulse-glow {
  0% { opacity: 0.8; box-shadow: 2px 0 8px rgba(99, 102, 241, 0.6); }
  50% { opacity: 1; box-shadow: 2px 0 15px rgba(99, 102, 241, 0.9); }
  100% { opacity: 0.8; box-shadow: 2px 0 8px rgba(99, 102, 241, 0.6); }
}

/* 6. Hover holati (Hali aktiv bo'lmagan linklar uchun) */
.sidebar-link:hover:not(.active-link) {
  @apply bg-slate-200/50 dark:bg-slate-700/40 text-slate-900 dark:text-white !important;
  transform: translateX(4px);
  transition: all 0.3s ease;
}
</style>
