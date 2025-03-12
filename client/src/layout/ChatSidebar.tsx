"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@clerk/nextjs";
import {
  LayoutGrid,
  FileText,
  MessageCircle,
  UserCircle,
  Settings,
  LogOut,
  MoreHorizontal,
  ChevronDown,
  Clock,
  PlusCircle,
  Loader2,
  Trash2
} from "lucide-react";
import { fetchChatHistory, deleteChat } from "@/app/api/chat-api/api";

const renderIcon = (icon: React.ReactNode) => {
  if (React.isValidElement(icon)) {
    return icon;
  }
  return icon; 
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Updated Chat History interface to match backend response
type ChatHistoryItem = {
  id: string;
  chatId: string;
  chatName: string;
  title: string;
  timestamp: string;
  preview: string;
};

// Simplified main nav - just Dashboard and My Documents
const navItems: NavItem[] = [
  {
    icon: <LayoutGrid size={20} />,
    name: "Dashboard",
    path: "/dashboard"
  },
  {
    icon: <FileText size={20} />,
    name: "My Documents",
    path: "/piper/my-docs"
  }
];

const othersItems: NavItem[] = [
  {
    icon: <UserCircle size={20} />,
    name: "Profile",
    path: "/dashboard/profile"
  },
  {
    icon: <Settings size={20} />,
    name: "Settings",
    subItems: [
      { name: "Account Settings", path: "/settings/account" },
      { name: "Privacy", path: "/settings/privacy" }
    ]
  },
  {
    icon: <LogOut size={20} color="red" />,
    name: "Signout",
    path: "/logout"
  }
];

const ChatSideBar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { getToken } = useAuth();
  const {id} = useParams();
  const router = useRouter();

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!getToken) return;
      
      setIsLoadingChats(true);
      setChatError(null);
      
      try {
        const token = await getToken();
        if (token) {
          const history = await fetchChatHistory(token);
          setChatHistory(history);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        setChatError("Failed to load chat history");
      } finally {
        setIsLoadingChats(false);
      }
    };
    
    loadChatHistory();
  }, [getToken, pathname]);

  const handleChatDeleted = (deletedChatId: string) => {
    // Check if the deleted chat is the one currently being viewed
    if (deletedChatId === id) {
      // Redirect to the home page
      router.push('/piper/chat');
    }
  };
  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm("Are you sure you want to delete this chat?")) {
      try {
        setDeletingChatId(chatId);
        const token = await getToken();
        if (token) {
          await deleteChat(chatId, token);
          setChatHistory(prevHistory => 
            prevHistory.filter(chat => chat.chatId !== chatId)
          );
          handleChatDeleted(chatId);
        }
      } catch (error) {
        console.error("Failed to delete chat:", error);
        alert("Failed to delete chat. Please try again.");
      } finally {
        setDeletingChatId(null);
      }
    }
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-sm group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active bg-piper-blue/[0.12] text-piper-blue  dark:text-piper-cyan dark:bg-piper-cyan/[0.12]"
                  : "menu-item-inactive text-gray-700 hover:bg-gray-100 group-hover:text-gray-700 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-300"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active text-brand-500 dark:text-brand-400"
                    : "menu-item-icon-inactive text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                }`}
              >
                {renderIcon(nav.icon)}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDown
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-piper-blue dark:text-piper-cyan"
                      : ""
                  }`}
                  size={20}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item text-gray-700 relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-sm group menu-item-active hover:bg-gray-50 hover:text-piper-blue hover:dark:text-piper-cyan hover:dark:bg-piper-darkblue/[0.12] dark:text-gray-300 ${
                  nav.name == "Signout" &&
                  "hover:bg-red-50/50 dark:hover:bg-red-500/30"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {renderIcon(nav.icon)}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span
                    className={`menu-item-text  ${
                      nav.name == "Signout" && "text-[red] dark:text-[red]"
                    }`}
                  >
                    {nav.name}
                  </span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px"
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item relative flex hover:text-piper-blue hover:bg-gray-50 dark:hover:text-piper-cyan dark:hover:bg-piper-darkblue/[0.12] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active bg-brand-50 text-piper-blue dark:bg-piper-blue/[0.12] dark:text-piper-lightblue"
                          : "menu-dropdown-item-inactive dark:text-piper-lightblue"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // New function to render chat history items
  const renderChatHistory = () => (
    <>
      <div className="mb-3">
        <Link
          href="/piper/chat"
          className="flex items-center w-full gap-2 px-3 py-2 text-sm font-medium bg-piper-blue hover:bg-piper-blue/90 text-white rounded-lg dark:bg-piper-cyan dark:text-gray-900 dark:hover:bg-piper-cyan/90 transition-colors"
        >
          <PlusCircle size={18} />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span>New Chat</span>
          )}
        </Link>
      </div>
      
      {isLoadingChats && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {chatError && (
        <div className="text-xs text-red-500 px-3 py-2">
          {chatError}
        </div>
      )}
      
      {!isLoadingChats && chatHistory.length === 0 && (
        <div className="text-xs text-muted-foreground px-3 py-2">
          No chat history found
        </div>
      )}
      
      <ul className="flex flex-col gap-2">
        {chatHistory.map((chat) => (
          <li key={chat.id}>
            <Link
              href={`/piper/chat/${chat.chatId}`}
              className={`menu-item text-gray-700 relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-sm group hover:bg-gray-50 hover:text-piper-blue dark:text-gray-300 hover:dark:text-piper-cyan hover:dark:bg-piper-darkblue/[0.12] ${
                pathname === `/piper/chat/${chat.chatId}` ? "bg-gray-100 dark:bg-gray-800" : ""
              }`}
            >
              <span className="text-gray-500">
                <MessageCircle size={18} />
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <>
                  <div className="flex-1 truncate">
                    <p className="truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(chat.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteChat(e, chat.chatId)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                    title="Delete chat"
                    disabled={deletingChatId === chat.chatId}
                  >
                    {deletingChatId === chat.chatId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo section */}
      <div
        className={`py-5 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <div className="flex items-center">
                <h1 className="text-gradient text-2xl">Piper Ai</h1>
              </div>
            </>
          ) : (
            <Image
              src="/piper-mascot.svg"
              alt="Logo"
              width={32}
              height={32}
              priority
            />
          )}
        </Link>
      </div>
      
      {/* Main Navigation section - fixed */}
      <div className="mb-6 mt-6">
          <h2
            className={`mb-3 text-xs uppercase flex leading-[20px] text-gray-400 ${
              !isExpanded && !isHovered
                ? "lg:justify-center"
                : "justify-start"
            }`}
          >
            {isExpanded || isHovered || isMobileOpen ? (
              "Menu"
            ) : (
              <MoreHorizontal size={20} />
            )}
          </h2>
          {renderMenuItems(navItems, "main")}
        </div>
      {/* Restructured content with fixed and scrollable sections */}
      <div className="flex flex-col h-full">
        {/* Chat History section - scrollable */}
        <div>
          <h2
            className={`mb-3 text-xs uppercase flex leading-[20px] text-gray-400 ${
              !isExpanded && !isHovered
                ? "lg:justify-center"
                : "justify-start"
            }`}
          >
            {isExpanded || isHovered || isMobileOpen ? (
              "Chat History"
            ) : (
              <Clock size={20} />
            )}
          </h2>
          <div className="overflow-y-auto max-h-[40vh] no-scrollbar pr-1">
            {renderChatHistory()}
          </div>
        </div>
        
        
        
        {/* Fixed bottom section for "Others" */}
        <div className="py-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <h2
            className={`mb-3 text-xs uppercase flex leading-[20px] text-gray-400 ${
              !isExpanded && !isHovered
                ? "lg:justify-center"
                : "justify-start"
            }`}
          >
            {isExpanded || isHovered || isMobileOpen ? (
              "Others"
            ) : (
              <MoreHorizontal size={20} />
            )}
          </h2>
          {renderMenuItems(othersItems, "others")}
        </div>
      </div>
    </aside>
  );
};

export default ChatSideBar;
