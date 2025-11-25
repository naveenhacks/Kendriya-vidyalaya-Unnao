
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext.tsx';
import { HomeworkContext } from '../../context/HomeworkContext.tsx';
import { NotificationContext } from '../../context/NotificationContext.tsx';
import { ActivityContext } from '../../context/ActivityContext.tsx';
import { ClassContext } from '../../context/ClassContext.tsx';
import { LandingPageContext } from '../../context/LandingPageContext.tsx';
import { User, UserRole } from '../../types.ts';
import AdminMessaging from './messaging/AdminMessaging.tsx';
import AdminHomepageManager from './admin/HomepageManager.tsx';
import ClassManagement from './admin/ClassManagement.tsx';
import ConfirmationModal from '../common/ConfirmationModal.tsx';
import Alert from '../common/Alert.tsx';
import { 
    Users, UserPlus, Trash2, Edit, X, ShieldAlert, 
    LayoutDashboard, GraduationCap, Presentation, BookMarked, MessageSquare, Bell, Settings, Search,
    Shield, ShieldOff, Globe, Activity, BookOpen, Download, Filter, Megaphone, Save, RefreshCw, AlertTriangle, Plus, PlusCircle,
    Eye, EyeOff
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// --- HELPER COMPONENTS ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement<any>; color: string }> = ({ title, value, icon, color }) => {
    const colorMap: { [key: string]: string } = {
        purple: 'bg-purple-500/20 text-purple-400',
        indigo: 'bg-indigo-500/20 text-indigo-400',
        blue: 'bg-blue-500/20 text-blue-400',
        green: 'bg-green-500/20 text-green-400',
        pink: 'bg-pink-500/20 text-pink-400',
        orange: 'bg-orange-500/20 text-orange-400',
    };
    const style = colorMap[color] || 'bg-gray-500/20 text-gray-400';

    return (
        <div className="bg-brand-light-blue p-5 rounded-xl border border-white/10 flex items-center space-x-4 transform transition-transform hover:-translate-y-1 h-full shadow-lg">
            <div className={`p-3 rounded-full ${style}`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <div>
                <p className="text-brand-silver-gray text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
};

// --- SUB-SECTIONS ---

const AdminOverview = ({ setActiveView }: { setActiveView: (view: string) => void }) => {
    const { users } = useContext(AuthContext);
    const { homeworks } = useContext(HomeworkContext);
    const { classes } = useContext(ClassContext);
    const { logs } = useContext(ActivityContext);
    const { notifications } = useContext(NotificationContext);

    const studentCount = users.filter(u => u.role === UserRole.Student).length;
    const teacherCount = users.filter(u => u.role === UserRole.Teacher).length;

    const userDistributionData = [
        { name: 'Students', value: studentCount },
        { name: 'Teachers', value: teacherCount },
    ];
    const COLORS = ['#8a2be2', '#c471ed'];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-brand-silver-gray">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={studentCount} icon={<GraduationCap />} color="purple" />
                <StatCard title="Total Teachers" value={teacherCount} icon={<Presentation />} color="indigo" />
                <StatCard title="Active Notices" value={notifications.length} icon={<Bell />} color="orange" />
                <StatCard title="Classes" value={classes.length} icon={<Users />} color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Log */}
                <div className="lg:col-span-2 bg-brand-light-blue p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2"><Activity size={20}/> Recent System Activity</h2>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {logs.length > 0 ? logs.slice(0, 10).map(log => (
                            <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                    log.type === 'success' ? 'bg-green-400' : 
                                    log.type === 'warning' ? 'bg-orange-400' : 
                                    log.type === 'critical' ? 'bg-red-400' : 'bg-blue-400'
                                }`} />
                                <div className="flex-1">
                                    <p className="text-sm text-white"><span className="font-bold text-brand-light-purple">{log.performedBy}</span> {log.action}</p>
                                    <p className="text-xs text-brand-silver-gray">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        )) : <p className="text-gray-500 italic">No recent activity.</p>}
                    </div>
                </div>
                
                {/* Ratio Chart */}
                <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10 flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 text-white">User Distribution</h2>
                    <div className="flex-grow min-h-[200px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={userDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                    {userDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e1a50', borderRadius: '8px', border: 'none' }} itemStyle={{ color: '#fff' }}/>
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <button onClick={() => setActiveView('students')} className="text-xs text-center p-2 bg-white/5 rounded hover:bg-white/10 transition-colors text-brand-light-purple">Manage Students</button>
                        <button onClick={() => setActiveView('teachers')} className="text-xs text-center p-2 bg-white/5 rounded hover:bg-white/10 transition-colors text-brand-light-purple">Manage Teachers</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TeacherModal: React.FC<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    user: Partial<User> | null;
    onSave: (user: Partial<User>) => Promise<User | void>;
    onClose: () => void;
}> = ({ isOpen, mode, user, onSave, onClose }) => {
    const { classes } = useContext(ClassContext);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [credentials, setCredentials] = useState<User | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => { 
        setFormData(user || {}); 
        setCredentials(null); 
        setShowPassword(false);
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await onSave(formData);
        if (mode === 'add' && res) setCredentials(res as User);
        else onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-brand-light-blue rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{credentials ? 'Teacher Added!' : `${mode === 'add' ? 'Add' : 'Edit'} Teacher`}</h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
                </div>
                {credentials ? (
                    <div className="bg-white/10 p-4 rounded-lg text-center space-y-4">
                        <div className="flex justify-center"><div className="p-3 bg-green-500/20 rounded-full text-green-400"><ShieldAlert size={32}/></div></div>
                        <p className="text-gray-300">Credentials generated. Please copy them now as they won't be shown again.</p>
                        <div className="text-left bg-black/30 p-4 rounded-lg space-y-2 border border-white/10">
                            <p className="text-sm text-gray-400">Email:</p>
                            <p className="text-white font-mono bg-white/5 p-1 rounded">{credentials.email}</p>
                            <p className="text-sm text-gray-400 mt-2">Password:</p>
                            <p className="text-white font-mono bg-white/5 p-1 rounded">{credentials.password}</p>
                        </div>
                        <button onClick={onClose} className="bg-brand-neon-purple text-white px-6 py-2 rounded-lg w-full hover:bg-opacity-80 transition-colors">Done</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-brand-silver-gray">Full Name</label>
                            <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full input-field mt-1" required />
                        </div>
                        <div>
                            <label className="text-sm text-brand-silver-gray">Email Address</label>
                            <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full input-field mt-1" required disabled={mode==='edit'}/>
                        </div>
                        
                         <div>
                            <label className="text-sm text-brand-silver-gray">
                                {mode === 'add' ? 'Initial Password' : 'Password (Credentials)'}
                            </label>
                            <div className="relative mt-1">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={formData.password || ''} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    className="w-full input-field pr-10" 
                                    required 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver-gray hover:text-white">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {mode === 'edit' && <p className="text-xs text-brand-silver-gray mt-1">Admin can view and update the user's password here.</p>}
                        </div>
                        
                        <div>
                            <label className="text-sm text-brand-silver-gray">Assign Class Teacher (Optional)</label>
                            <select value={formData.assignedClass || ''} onChange={e => setFormData({...formData, assignedClass: e.target.value})} className="w-full input-field mt-1">
                                <option value="">None</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex justify-end pt-4 space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20">Cancel</button>
                            <button type="submit" className="bg-brand-neon-purple text-white px-6 py-2 rounded-lg hover:bg-opacity-80">Save Teacher</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

const AdminTeacherManagement = () => {
    const { users, addTeacher, updateUser, deleteUser } = useContext(AuthContext);
    const { logActivity } = useContext(ActivityContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [searchTerm, setSearchTerm] = useState('');

    const teachers = useMemo(() => {
        return users.filter(u => u.role === UserRole.Teacher && 
            (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [users, searchTerm]);

    const handleSave = async (data: Partial<User>) => {
        if (mode === 'add') {
            const res = await addTeacher(data.name!, data.email!, data.password!);
            logActivity(`Added teacher ${res.name}`, 'Admin', 'success');
            return res;
        } else {
            await updateUser(data.id!, data);
            logActivity(`Updated teacher ${data.name}`, 'Admin', 'info');
        }
    };

    const toggleBlock = async (teacher: User) => {
        await updateUser(teacher.id, { blocked: !teacher.blocked });
        logActivity(`${teacher.blocked ? 'Unblocked' : 'Blocked'} teacher ${teacher.name}`, 'Admin', 'warning');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Teacher Management</h1>
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input 
                            type="text" 
                            placeholder="Search teachers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-neon-purple"
                        />
                    </div>
                    <button onClick={() => { setMode('add'); setCurrentUser({}); setIsModalOpen(true); }} className="flex items-center space-x-2 bg-brand-neon-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors shrink-0">
                        <UserPlus size={18}/><span>Add Teacher</span>
                    </button>
                </div>
            </div>

            <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10 overflow-x-auto shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/20 text-brand-silver-gray text-sm uppercase tracking-wider">
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {teachers.length > 0 ? teachers.map(t => (
                            <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-neon-purple/20 flex items-center justify-center text-brand-light-purple font-bold">
                                            {t.name.charAt(0)}
                                        </div>
                                        <span className={`font-medium ${t.blocked ? 'text-gray-500 line-through' : 'text-white'}`}>{t.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300">{t.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${t.blocked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                                        {t.blocked ? 'Blocked' : 'Active'}
                                    </span>
                                </td>
                                <td className="p-4 text-right flex items-center justify-end space-x-2">
                                    <button onClick={() => toggleBlock(t)} className={`p-2 rounded-lg transition-colors ${t.blocked ? 'text-green-400 hover:bg-green-500/20' : 'text-orange-400 hover:bg-orange-500/20'}`} title={t.blocked ? "Unblock" : "Block Access"}>
                                        {t.blocked ? <ShieldOff size={18}/> : <Shield size={18}/>}
                                    </button>
                                    <button onClick={() => { setMode('edit'); setCurrentUser(t); setIsModalOpen(true); }} className="text-blue-400 p-2 hover:bg-blue-500/20 rounded-lg" title="Edit Details"><Edit size={18}/></button>
                                    <button onClick={() => deleteUser(t.id, t.uid)} className="text-red-400 p-2 hover:bg-red-500/20 rounded-lg" title="Delete Account"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No teachers found matching your search.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <TeacherModal isOpen={isModalOpen} mode={mode} user={currentUser} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

const StudentModal: React.FC<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    user: Partial<User> | null;
    onSave: (user: Partial<User>) => Promise<User | void>;
    onClose: () => void;
}> = ({ isOpen, mode, user, onSave, onClose }) => {
    const { classes } = useContext(ClassContext);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [credentials, setCredentials] = useState<User | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => { 
        setFormData(user || { studentData: { courses: [], attendance: 0, overallGrade: 0 } }); 
        setCredentials(null); 
        setShowPassword(false);
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await onSave(formData);
        if (mode === 'add' && res) setCredentials(res as User);
        else onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-brand-light-blue rounded-2xl border border-white/10 p-6 shadow-2xl">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{credentials ? 'Student Added!' : `${mode === 'add' ? 'Add' : 'Edit'} Student`}</h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
                </div>
                {credentials ? (
                    <div className="bg-white/10 p-4 rounded-lg text-center space-y-4">
                         <div className="flex justify-center"><div className="p-3 bg-green-500/20 rounded-full text-green-400"><GraduationCap size={32}/></div></div>
                         <p className="text-gray-300">Student account created successfully.</p>
                         <div className="text-left bg-black/30 p-4 rounded-lg space-y-2 border border-white/10">
                            <p className="text-sm text-gray-400">Apaar ID (Login ID):</p>
                            <p className="text-white font-mono bg-white/5 p-1 rounded">{credentials.id}</p>
                            <p className="text-sm text-gray-400 mt-2">Password:</p>
                            <p className="text-white font-mono bg-white/5 p-1 rounded">{credentials.password}</p>
                        </div>
                        <button onClick={onClose} className="bg-brand-neon-purple text-white px-6 py-2 rounded-lg w-full hover:bg-opacity-80 transition-colors">Done</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-brand-silver-gray">Full Name</label>
                            <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full input-field mt-1" required />
                        </div>
                        <div>
                             <label className="text-sm text-brand-silver-gray">Apaar ID (Roll No.)</label>
                            <input type="text" value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full input-field mt-1" required disabled={mode==='edit'}/>
                        </div>
                        
                         <div>
                            <label className="text-sm text-brand-silver-gray">
                                {mode === 'add' ? 'Password' : 'Password (Credentials)'}
                            </label>
                            <div className="relative mt-1">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={formData.password || ''} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    className="w-full input-field pr-10" 
                                    required 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver-gray hover:text-white">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                             {mode === 'edit' && <p className="text-xs text-brand-silver-gray mt-1">Admin can view and update the user's password here.</p>}
                        </div>
                        
                         <div>
                            <label className="text-sm text-gray-400">Class Assignment</label>
                            <select 
                                value={formData.studentData?.className || ''} 
                                onChange={e => setFormData({
                                    ...formData, 
                                    studentData: { ...formData.studentData!, className: e.target.value }
                                })} 
                                className="w-full input-field mt-1"
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end pt-4 space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20">Cancel</button>
                            <button type="submit" className="bg-brand-neon-purple text-white px-6 py-2 rounded-lg hover:bg-opacity-80">Save Student</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

const AdminStudentManagement = () => {
    const { users, addStudent, updateUser, deleteUser } = useContext(AuthContext);
    const { classes } = useContext(ClassContext);
    const { logActivity } = useContext(ActivityContext);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('All');

    const students = useMemo(() => {
        return users.filter(u => {
            const matchesRole = u.role === UserRole.Student;
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesClass = filterClass === 'All' || u.studentData?.className === filterClass;
            return matchesRole && matchesSearch && matchesClass;
        });
    }, [users, searchTerm, filterClass]);

    const handleSave = async (data: Partial<User>) => {
        if (mode === 'add') {
             const res = await addStudent(data.name!, data.id!, data.password!);
             logActivity(`Added student ${res.name}`, 'Admin', 'success');
             if (data.studentData?.className) {
                 await updateUser(res.id, { studentData: { ...res.studentData, className: data.studentData.className } });
             }
             return res;
        } else {
            await updateUser(data.id!, data);
            logActivity(`Updated student ${data.name}`, 'Admin', 'info');
        }
    };

    const toggleBlock = async (student: User) => {
        await updateUser(student.id, { blocked: !student.blocked });
        logActivity(`${student.blocked ? 'Unblocked' : 'Blocked'} student ${student.name}`, 'Admin', 'warning');
    };

     return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Student Management</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="relative w-full md:w-auto">
                         <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                         <select 
                            value={filterClass} 
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="w-full md:w-48 bg-white/5 border border-white/10 rounded-lg pl-10 pr-8 py-2 text-white appearance-none focus:outline-none focus:border-brand-neon-purple"
                         >
                             <option value="All">All Classes</option>
                             {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                         </select>
                    </div>
                    <div className="relative w-full md:w-auto flex-grow xl:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input 
                            type="text" 
                            placeholder="Search name or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-neon-purple"
                        />
                    </div>
                    <button onClick={() => { setMode('add'); setCurrentUser({}); setIsModalOpen(true); }} className="w-full md:w-auto flex items-center justify-center space-x-2 bg-brand-neon-purple text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors shrink-0">
                        <UserPlus size={18}/><span>Add Student</span>
                    </button>
                </div>
            </div>

            <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10 overflow-x-auto shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/20 text-brand-silver-gray text-sm uppercase tracking-wider">
                            <th className="p-4">Name</th>
                            <th className="p-4">Apaar ID</th>
                            <th className="p-4">Class</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {students.length > 0 ? students.map(s => (
                            <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                     <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                            {s.name.charAt(0)}
                                        </div>
                                        <span className={`font-medium ${s.blocked ? 'text-gray-500 line-through' : 'text-white'}`}>{s.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300 font-mono text-sm">{s.id}</td>
                                <td className="p-4 text-gray-300">{s.studentData?.className || <span className="text-gray-500 italic">Unassigned</span>}</td>
                                 <td className="p-4">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${s.blocked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                                        {s.blocked ? 'Blocked' : 'Active'}
                                    </span>
                                </td>
                                <td className="p-4 text-right flex items-center justify-end space-x-2">
                                     <button onClick={() => toggleBlock(s)} className={`p-2 rounded-lg transition-colors ${s.blocked ? 'text-green-400 hover:bg-green-500/20' : 'text-orange-400 hover:bg-orange-500/20'}`} title={s.blocked ? "Unblock" : "Block Access"}>
                                        {s.blocked ? <ShieldOff size={18}/> : <Shield size={18}/>}
                                    </button>
                                    <button onClick={() => { setMode('edit'); setCurrentUser(s); setIsModalOpen(true); }} className="text-blue-400 p-2 hover:bg-blue-500/20 rounded-lg" title="Edit"><Edit size={18}/></button>
                                    <button onClick={() => deleteUser(s.id, s.uid)} className="text-red-400 p-2 hover:bg-red-500/20 rounded-lg" title="Delete"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        )) : (
                             <tr><td colSpan={5} className="p-8 text-center text-gray-500">No students found. Try adjusting filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <StudentModal isOpen={isModalOpen} mode={mode} user={currentUser} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

const NoticesManager = () => {
    const { notifications, addNotification, deleteNotification } = useContext(NotificationContext);
    const { logActivity } = useContext(ActivityContext);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [target, setTarget] = useState<'all' | UserRole.Teacher | UserRole.Student>('all');
    const [alert, setAlert] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !content) return;
        
        await addNotification({ title, content, target });
        logActivity(`Posted notice: ${title} for ${target}`, 'Admin', 'info');
        setAlert({ message: 'Notice posted successfully!', type: 'success' });
        setTitle('');
        setContent('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnimatePresence>
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </AnimatePresence>
            <div className="lg:col-span-1 space-y-6">
                <h1 className="text-3xl font-bold text-white">Notice Board</h1>
                <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10 shadow-xl">
                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2"><PlusCircle size={20}/> Create Notice</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-brand-silver-gray">Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full input-field mt-1" placeholder="e.g. Holiday Announcement" required />
                        </div>
                        <div>
                            <label className="text-sm text-brand-silver-gray">Target Audience</label>
                            <select value={target} onChange={e => setTarget(e.target.value as any)} className="w-full input-field mt-1">
                                <option value="all">Everyone</option>
                                <option value={UserRole.Student}>Students Only</option>
                                <option value={UserRole.Teacher}>Teachers Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-brand-silver-gray">Content</label>
                            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full input-field mt-1" placeholder="Write your notice here..." required />
                        </div>
                        <button type="submit" className="w-full bg-brand-neon-purple text-white py-2 rounded-lg hover:bg-opacity-80 transition-colors flex items-center justify-center gap-2">
                            <Megaphone size={18} /> Publish Notice
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                 <h2 className="text-2xl font-bold text-white lg:mt-0 mt-8">Active Notices</h2>
                 <div className="grid grid-cols-1 gap-4">
                    {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-start group hover:bg-white/10 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${n.target === 'all' ? 'bg-blue-500/20 text-blue-400' : n.target === UserRole.Student ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                    <Bell size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-white text-lg">{n.title}</h3>
                                        <span className="text-xs px-2 py-0.5 rounded border border-white/10 text-brand-silver-gray uppercase">{n.target}</span>
                                    </div>
                                    <p className="text-gray-300 mt-1">{n.content}</p>
                                    <p className="text-xs text-gray-500 mt-2">{new Date(n.date).toLocaleString()} • Read by {n.readBy?.length || 0} users</p>
                                </div>
                            </div>
                            <button onClick={() => deleteNotification(n.id)} className="text-gray-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )) : (
                        <div className="bg-white/5 border border-white/10 p-8 rounded-xl text-center text-gray-500">
                            <Bell size={48} className="mx-auto mb-4 opacity-30" />
                            <p>No active notices. Create one to broadcast information.</p>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

const SettingsSection = () => {
    const { users } = useContext(AuthContext);
    const { content, updateContactInfo } = useContext(LandingPageContext);
    const { logActivity } = useContext(ActivityContext);
    const [alert, setAlert] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [contactForm, setContactForm] = useState(content.contactInfo);

    const handleContactSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateContactInfo(contactForm);
        logActivity('Updated School Contact Info', 'Admin', 'info');
        setAlert({ message: 'School settings saved successfully!', type: 'success' });
    };

    const exportData = () => {
        const fullBackup = {
            users,
            homepage: content,
            timestamp: new Date().toISOString()
        };
        const dataStr = JSON.stringify(fullBackup, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `kvision_backup_${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        logActivity('Exported system data backup', 'Admin', 'info');
    };

    const resetSystem = () => {
        if(window.confirm("CRITICAL WARNING: This will wipe all local data including users, classes, and settings. This cannot be undone. Are you absolutely sure?")) {
             localStorage.clear();
             window.location.reload();
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <AnimatePresence>
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </AnimatePresence>
            <h1 className="text-3xl font-bold text-white">System Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* School Profile Settings */}
                <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10 md:col-span-2">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Globe size={20}/> School Profile</h2>
                    <form onSubmit={handleContactSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                             <label className="text-sm text-brand-silver-gray">School Name</label>
                             <input type="text" value={contactForm.schoolName} onChange={e => setContactForm({...contactForm, schoolName: e.target.value})} className="w-full input-field mt-1" />
                        </div>
                        <div>
                             <label className="text-sm text-brand-silver-gray">Phone Contact</label>
                             <input type="text" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} className="w-full input-field mt-1" />
                        </div>
                        <div>
                             <label className="text-sm text-brand-silver-gray">Email Address</label>
                             <input type="text" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} className="w-full input-field mt-1" />
                        </div>
                         <div className="md:col-span-2">
                             <label className="text-sm text-brand-silver-gray">Address</label>
                             <input type="text" value={contactForm.address} onChange={e => setContactForm({...contactForm, address: e.target.value})} className="w-full input-field mt-1" />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" className="bg-brand-neon-purple text-white px-6 py-2 rounded-lg hover:bg-opacity-80 flex items-center gap-2">
                                <Save size={18} /> Save Profile
                            </button>
                        </div>
                    </form>
                </div>

                {/* Data Management */}
                <div className="bg-brand-light-blue p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Download size={20}/> Data Backup</h2>
                    <p className="text-brand-silver-gray mb-6 text-sm">Download a full JSON backup of your user database and system configurations.</p>
                    <button onClick={exportData} className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
                        <Download size={18} /><span>Export System Data</span>
                    </button>
                </div>

                {/* Danger Zone */}
                 <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/30">
                    <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2"><AlertTriangle size={20}/> Danger Zone</h2>
                    <p className="text-red-300/70 mb-6 text-sm">Permanently reset the application to its initial state. All users and data will be lost.</p>
                    <button onClick={resetSystem} className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors">
                        <RefreshCw size={18} /><span>Factory Reset System</span>
                    </button>
                </div>
            </div>
            
             <div className="text-center text-brand-silver-gray text-xs pt-8">
                <p>KVISION Admin Panel v2.5.0</p>
                <p>System Status: <span className="text-green-400">Online (Local Mode)</span></p>
            </div>
        </div>
    );
}

// --- MAIN DASHBOARD LAYOUT ---

const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'homepage', label: 'Homepage Manager', icon: <Globe size={20} /> },
    { id: 'notifications', label: 'Notices & News', icon: <Bell size={20} /> },
    { id: 'teachers', label: 'Teachers', icon: <Presentation size={20} /> },
    { id: 'students', label: 'Students', icon: <GraduationCap size={20} /> },
    { id: 'classes', label: 'Classes & Courses', icon: <BookOpen size={20} /> },
    { id: 'homework', label: 'Homework Control', icon: <BookMarked size={20} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { id: 'settings', label: 'System Settings', icon: <Settings size={20} /> },
];

const AdminSidebar: React.FC<{ 
    activeView: string; 
    setActiveView: (view: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
    const { user } = useContext(AuthContext);

    return (
        <>
            <motion.div
                initial={false}
                animate={{ x: isOpen ? 0 : '-100%' }}
                className={`fixed inset-y-0 left-0 w-64 bg-brand-light-blue rounded-r-2xl shadow-2xl z-40 lg:relative lg:translate-x-0 lg:flex-shrink-0 border-r border-white/5 flex flex-col`}
            >
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center space-x-3 mb-8 p-3 bg-white/5 rounded-xl border border-white/5">
                        <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`} alt="Admin" className="w-10 h-10 rounded-full border-2 border-brand-neon-purple"/>
                        <div className="overflow-hidden">
                            <p className="font-bold text-white text-sm truncate">{user?.name}</p>
                            <p className="text-xs text-brand-neon-purple font-semibold uppercase">Super Admin</p>
                        </div>
                    </div>
                    <nav className="flex-grow overflow-y-auto space-y-1 custom-scrollbar pr-2">
                        {navItems.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => { setActiveView(item.id); if (window.innerWidth < 1024) setIsOpen(false); }}
                                className={`flex items-center w-full space-x-3 p-3 rounded-lg transition-all text-sm font-medium ${
                                    activeView === item.id 
                                    ? 'bg-gradient-to-r from-brand-neon-purple to-brand-light-purple text-white shadow-lg shadow-brand-neon-purple/20' 
                                    : 'text-brand-silver-gray hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </motion.div>
             <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>
        </>
    );
};

const AdminDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState('overview');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedMessageUserId, setSelectedMessageUserId] = useState<string | null>(null);

    const renderContent = () => {
        switch(activeView) {
            case 'overview': return <AdminOverview setActiveView={setActiveView} />;
            case 'homepage': return <AdminHomepageManager />;
            case 'teachers': return <AdminTeacherManagement />;
            case 'students': return <AdminStudentManagement />;
            case 'notifications': return <NoticesManager />;
            case 'classes': return <ClassManagement />;
            case 'messages': return <AdminMessaging selectedUserId={selectedMessageUserId} setSelectedUserId={setSelectedMessageUserId} />;
            case 'settings': return <SettingsSection />;
            default: return <AdminOverview setActiveView={setActiveView} />;
        }
    }
    
    return (
        <div className="flex h-screen bg-brand-deep-blue text-white overflow-hidden relative">
             <button 
                className="lg:hidden absolute top-4 left-4 z-20 p-2 bg-brand-light-blue rounded-lg text-white"
                onClick={() => setSidebarOpen(true)}
             >
                <LayoutDashboard size={24} />
             </button>
             
             <AdminSidebar 
                activeView={activeView} 
                setActiveView={setActiveView}
                isOpen={isSidebarOpen}
                setIsOpen={setSidebarOpen}
             />
             
             <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-gradient-to-br from-brand-deep-blue to-[#0f0c29]">
                 <div className="p-4 sm:p-6 lg:p-8 min-h-full max-w-[1600px] mx-auto">
                     <AnimatePresence mode="wait">
                         <motion.div
                             key={activeView}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -10 }}
                             transition={{ duration: 0.3 }}
                         >
                            {renderContent()}
                         </motion.div>
                     </AnimatePresence>
                 </div>
             </main>
        </div>
    );
};

export default AdminDashboard;
