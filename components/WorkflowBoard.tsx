
import React, { useState, useEffect, useMemo } from "react";
import { 
  FolderKanban, 
  MoreVertical, 
  Plus, 
  Calendar, 
  Edit3, 
  Trash2, 
  Search, 
  Target,
  TrendingUp,
  TrendingDown, 
  PieChart,
  DollarSign
} from "lucide-react";
import { UserRole } from "../types";
import ProjectModal from "./workflow/ProjectModal";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { useRealtime } from "../hooks/useRealtime";

type ProjectStatus = "ALL" | "ACTIVE" | "PENDING" | "COMPLETED";

export interface ProjectItem {
  id: string;
  title: string;
  client_name: string;
  deadline: string;
  total_amount: number;
  cost: number;
  paul_share: number;
  status: "ACTIVE" | "PENDING" | "COMPLETED";
}

const INITIAL_PROJECTS: ProjectItem[] = [
  { id: "PRJ-8821", title: "Aramco Logistics Hub Catering", client_name: "Aramco", deadline: "2024-11-15", total_amount: 45000, cost: 28500, paul_share: 4500, status: "ACTIVE" },
  { id: "PRJ-9012", title: "Red Sea Global Staff Feeding", client_name: "Red Sea Global", deadline: "2024-12-01", total_amount: 125000, cost: 95000, paul_share: 12500, status: "PENDING" },
  { id: "PRJ-4410", title: "SABIC Industrial Event Setup", client_name: "SABIC", deadline: "2024-10-20", total_amount: 28000, cost: 18000, paul_share: 2800, status: "COMPLETED" },
  { id: "PRJ-1102", title: "JAG Regional Summit", client_name: "JAG Arabia", deadline: "2024-11-05", total_amount: 15000, cost: 9000, paul_share: 1500, status: "ACTIVE" },
];

interface WorkflowBoardProps {
  userRole: UserRole;
  initialFilter?: string;
}

const WorkflowBoard: React.FC<WorkflowBoardProps> = ({ userRole, initialFilter }) => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>((initialFilter as ProjectStatus) || "ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { execute } = useAsyncAction();

  // ACTIVATE REALTIME LISTENER
  // This will trigger toasts when data changes in the 'projects' table
  useRealtime('projects');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  
  // Dropdown State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const isAdmin = userRole === UserRole.ADMIN;

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter as ProjectStatus);
    }
  }, [initialFilter]);

  // Simulate API Data Fetching
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // Simulate network latency for fetching project data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProjects(INITIAL_PROJECTS);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // CRUD Handlers
  const handleCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleEdit = (project: ProjectItem) => {
    setEditingProject(project);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveProject = async (data: any) => {
    // Simulate API Delay
    await new Promise(resolve => setTimeout(resolve, 600));

    if (data.id) {
      // Update
      setProjects(prev => prev.map(p => p.id === data.id ? { ...p, ...data } : p));
    } else {
      // Create
      const newProject = {
        ...data,
        id: `PRJ-${Math.floor(Math.random() * 9000) + 1000}`
      };
      setProjects(prev => [newProject, ...prev]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    
    await execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API
      setProjects(prev => prev.filter(p => p.id !== id));
    }, "Project record purged.");
    setOpenMenuId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case 'COMPLETED': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case 'PENDING': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-slate-800 text-slate-500 border-slate-700";
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.client_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [projects, statusFilter, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20" onClick={() => setOpenMenuId(null)}>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4">
            <FolderKanban className="text-blue-500" size={32} /> Projects
          </h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Orchestrate active job nodes and financial milestones.</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); handleCreate(); }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
          <Plus size={18} /> Initialize Project
        </button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-950/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
        <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/5 w-full lg:w-auto">
          {['ALL', 'ACTIVE', 'PENDING', 'COMPLETED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter as ProjectStatus)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === filter 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search projects or clients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* PROJECT TABLE */}
      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-visible shadow-2xl relative group">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <FolderKanban size={500} />
        </div>

        <div className="overflow-x-visible relative z-10">
           {isLoading ? (
            <div className="p-20 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse flex items-center px-8 gap-4">
                  <div className="h-4 w-32 bg-white/10 rounded"></div>
                  <div className="flex-1"></div>
                  <div className="h-4 w-20 bg-white/10 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="p-8">Identification</th>
                  <th className="p-8">Entity</th>
                  <th className="p-8">Revenue</th>
                  {isAdmin && <th className="p-8">Cost Vector</th>}
                  <th className="p-8">{isAdmin ? "Commission" : "My Share"}</th>
                  {isAdmin && <th className="p-8">Net Profit</th>}
                  <th className="p-8">State</th>
                  <th className="p-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProjects.map((project) => {
                  const netProfit = project.total_amount - project.cost - project.paul_share;
                  return (
                    <tr key={project.id} className="group hover:bg-white/5 transition-colors cursor-pointer relative">
                      <td className="p-8" onClick={() => handleEdit(project)}>
                        <p className="font-bold text-white text-base tracking-tight">{project.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{project.id}</p>
                           <span className="text-[10px] text-slate-600">•</span>
                           <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1"><Calendar size={10} /> {project.deadline || "--"}</p>
                        </div>
                      </td>
                      <td className="p-8" onClick={() => handleEdit(project)}>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                             <Target size={14} />
                           </div>
                           <span className="text-slate-300 font-medium text-sm">{project.client_name}</span>
                        </div>
                      </td>
                      
                      {/* REVENUE */}
                      <td className="p-8" onClick={() => handleEdit(project)}>
                        <p className="font-mono font-bold text-white tracking-tighter">
                          <span className="text-[10px] text-slate-600 mr-1">SAR</span>
                          {project.total_amount.toLocaleString()}
                        </p>
                      </td>

                      {/* ADMIN: COST */}
                      {isAdmin && (
                        <td className="p-8" onClick={() => handleEdit(project)}>
                          <p className="font-mono font-bold text-rose-400 tracking-tighter opacity-80">
                            <span className="text-[10px] text-rose-500/50 mr-1">SAR</span>
                            -{project.cost.toLocaleString()}
                          </p>
                        </td>
                      )}

                      {/* COMMISSION / SHARE */}
                      <td className="p-8" onClick={() => handleEdit(project)}>
                        <div className="flex items-center gap-2">
                          <p className={`font-mono font-bold tracking-tighter ${isAdmin ? 'text-amber-400' : 'text-emerald-400'}`}>
                            <span className="text-[10px] opacity-50 mr-1">SAR</span>
                            {isAdmin ? `-${project.paul_share.toLocaleString()}` : `+${project.paul_share.toLocaleString()}`}
                          </p>
                          {isAdmin && <span className="text-[8px] font-bold text-slate-600 bg-slate-800 px-1.5 rounded uppercase">Comm</span>}
                        </div>
                      </td>

                      {/* ADMIN: NET PROFIT */}
                      {isAdmin && (
                        <td className="p-8" onClick={() => handleEdit(project)}>
                          <div className={`flex items-center gap-2 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                             {netProfit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                             <p className="font-mono font-black tracking-tighter text-lg">
                               {netProfit.toLocaleString()}
                             </p>
                          </div>
                          <div className="w-16 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                             <div 
                               className={`h-full ${netProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                               style={{ width: `${Math.min(Math.max((netProfit / project.total_amount) * 100, 0), 100)}%` }} 
                             />
                          </div>
                        </td>
                      )}

                      {/* STATUS */}
                      <td className="p-8" onClick={() => handleEdit(project)}>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      
                      {/* ACTIONS */}
                      <td className="p-8 text-right relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === project.id ? null : project.id);
                          }}
                          className="p-3 text-slate-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 bg-slate-950 rounded-xl border border-slate-800"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenuId === project.id && (
                          <div className="absolute right-8 top-12 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                              className="w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3"
                            >
                              <Edit3 size={14} className="text-blue-400" /> Edit Financials
                            </button>
                            <div className="h-px bg-slate-800 mx-3 my-1" />
                            <button 
                               onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                               className="w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 flex items-center gap-3"
                            >
                              <Trash2 size={14} /> Purge
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 6} className="p-24 text-center">
                      <FolderKanban size={48} className="mx-auto text-slate-800 mb-4" />
                      <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-xs">No matching projects found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveProject}
        projectToEdit={editingProject}
        userRole={userRole}
      />
    </div>
  );
};

export default WorkflowBoard;
