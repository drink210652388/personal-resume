import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

// --- Types ---
interface Experience {
  id: string;
  role: string;
  company: string;
  dates: string;
  description: string;
}

interface Attachment {
  name: string;
  url: string; // Base64
}

interface ProjectMedia {
  id: string;
  type: "image" | "video";
  url: string; // Base64
}

interface Project {
  id: string;
  title: string;
  description: string;
  linkUrl?: string;
  media: ProjectMedia[]; 
  attachments: Attachment[];
}

interface Profile {
  name: string;
  title: string;
  summary: string;
  email: string;
  phone: string;
  birthday: string;
  wechatId: string;
  wechatQrUrl: string; // Base64
  location: string;
  avatarUrl: string;
}

interface ResumeData {
  profile: Profile;
  experience: Experience[];
  skills: string[];
  projects: Project[];
}

// --- Initial Data ---
const INITIAL_DATA: ResumeData = {
  profile: {
    name: "Alex Designer",
    title: "Senior Product Designer",
    summary: "Creative technologist with 5+ years of experience in building digital products. Passionate about UI/UX and frontend development.",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    birthday: "1990-05-15",
    wechatId: "alex_design_90",
    wechatQrUrl: "",
    location: "San Francisco, CA",
    avatarUrl: "",
  },
  experience: [
    {
      id: "1",
      role: "Senior UI Engineer",
      company: "TechFlow Inc.",
      dates: "2021 - Present",
      description: "Leading the design system initiative. Rebuilding the core product dashboard using React.",
    },
    {
      id: "2",
      role: "Frontend Developer",
      company: "WebStudio",
      dates: "2018 - 2021",
      description: "Collaborated with clients to deliver high-quality marketing websites. Optimized site performance.",
    },
  ],
  skills: ["React", "TypeScript", "Figma", "Node.js", "Design Systems", "Three.js", "UI/UX", "Next.js"],
  projects: [],
};

// --- Utilities ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// --- Icons ---
const IconEdit = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconEye = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconArrowRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const IconDownload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconImage = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const IconVideo = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const IconLayers = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;

// --- Components ---

const Lightbox = ({ 
  mediaUrl, 
  mediaType,
  projectName,
  onClose 
}: { 
  mediaUrl: string; 
  mediaType: "image" | "video"; 
  projectName?: string;
  onClose: () => void; 
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
       <button className="lightbox-close" onClick={onClose}><IconX /></button>
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
        {mediaType === 'video' ? (
          <video src={mediaUrl} controls autoPlay className="lightbox-media" />
        ) : (
          <img src={mediaUrl} alt="Preview" className="lightbox-media" />
        )}
        {projectName && (
           <div style={{
             position: 'absolute',
             bottom: 20,
             left: 20,
             background: 'rgba(0,0,0,0.6)',
             color: 'rgba(255,255,255,0.8)',
             padding: '4px 12px',
             borderRadius: '4px',
             fontSize: '0.9rem',
             pointerEvents: 'none',
             fontWeight: 500
           }}>
             {projectName}
           </div>
        )}
      </div>
    </div>
  );
};

const ContactModal = ({ profile, onClose }: { profile: Profile; onClose: () => void }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
         <button className="modal-close" onClick={onClose}><IconX /></button>
         
         <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#333', margin: '0 auto 1.5rem', backgroundImage: `url(${profile.avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
         
         <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{profile.name}</h2>
         <p style={{ color: 'var(--accent)', marginBottom: '2rem' }}>{profile.title}</p>
         
         <div style={{ display: 'grid', gap: '1rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <span style={{ color: '#888' }}>Location</span>
               <span>{profile.location}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <span style={{ color: '#888' }}>Phone</span>
               <span>{profile.phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <span style={{ color: '#888' }}>Email</span>
               <span>{profile.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ color: '#888' }}>WeChat</span>
               <span>{profile.wechatId}</span>
            </div>
         </div>

         {profile.wechatQrUrl && (
           <div style={{ marginTop: '2rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase' }}>WeChat QR Code</div>
              <img src={profile.wechatQrUrl} style={{ width: 150, borderRadius: 8 }} />
           </div>
         )}
      </div>
    </div>
  );
};

// --- View Mode Components ---

const Hero = ({ profile, onOpenContact }: { profile: Profile; onOpenContact: () => void }) => (
  <header className="hero-section container">
    <div className="hero-content">
      <span className="hero-eyebrow">Hello, I'm</span>
      <h1 className="hero-title">
        {profile.name}
      </h1>
      <p className="hero-role">{profile.title}</p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={onOpenContact} className="btn btn-primary">
           Contact Info
        </button>
      </div>
    </div>

    {/* Visual Element (Avatar/Abstract) */}
    <div className="hero-visual">
       <div className="hero-img-container">
         <div 
           style={{ 
             width: '100%', 
             height: '100%', 
             backgroundImage: profile.avatarUrl ? `url(${profile.avatarUrl})` : 'radial-gradient(circle, #333, #000)',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             filter: 'grayscale(30%) contrast(1.1)'
           }} 
         />
       </div>
    </div>
  </header>
);

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="section container">
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      <div className="section-line"></div>
    </div>
    {children}
  </section>
);

const ProjectMediaItem = ({ 
  media, 
  projectName, 
  onClick 
}: { 
  media: ProjectMedia, 
  projectName: string, 
  onClick: () => void 
}) => {
  return (
    <div 
      className="project-media-container" 
      onClick={onClick}
    >
      {media.type === 'video' ? (
         <video src={media.url} muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} playsInline />
      ) : (
         <img src={media.url} loading="lazy" />
      )}
      
      {/* Watermark/Logo Overlay */}
      <div className="media-watermark">
         {projectName}
      </div>
    </div>
  );
};

const ResumeView = ({ data }: { data: ResumeData }) => {
  const [lightbox, setLightbox] = useState<{url: string, type: 'image'|'video', projectName: string} | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

  // Helper to extract all media from all projects for filtering
  const getAllMedia = () => {
    let allMedia: { media: ProjectMedia, project: Project }[] = [];
    data.projects.forEach(p => {
      p.media.forEach(m => {
        if (filter === 'all' || m.type === filter) {
          allMedia.push({ media: m, project: p });
        }
      });
    });
    return allMedia;
  };

  const filteredMedia = getAllMedia();

  return (
    <>
      <Hero profile={data.profile} onOpenContact={() => setShowContact(true)} />

      <Section id="about" title="About">
        <div className="glass-card">
           <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#ccc', lineHeight: 1.8 }}>{data.profile.summary}</p>
           <div>
             <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '1rem' }}>Expertise</h3>
             <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {data.skills.map((skill, i) => <span key={i} className="tag">{skill}</span>)}
             </div>
           </div>
        </div>
      </Section>

      <Section id="projects" title="Selected Works">
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <IconLayers /> All Projects
          </button>
          <button 
            className={`filter-btn ${filter === 'image' ? 'active' : ''}`}
            onClick={() => setFilter('image')}
          >
            <IconImage /> Images Only
          </button>
          <button 
            className={`filter-btn ${filter === 'video' ? 'active' : ''}`}
            onClick={() => setFilter('video')}
          >
            <IconVideo /> Videos Only
          </button>
        </div>

        {filter === 'all' ? (
           // Project Group View
           <div className="horizontal-scroll-container">
             {data.projects.map(proj => (
               <div key={proj.id} className="project-card-horizontal">
                  <div className="project-card-header">
                    <h3>{proj.title}</h3>
                    <p>{proj.description}</p>
                    {proj.linkUrl && (
                      <a href={proj.linkUrl} target="_blank" rel="noreferrer" className="link-btn">
                        Visit <IconArrowRight />
                      </a>
                    )}
                  </div>
                  
                  {/* Media Reel for this Project */}
                  <div className="project-reel">
                    {proj.media.length > 0 ? (
                      proj.media.map(m => (
                        <ProjectMediaItem 
                          key={m.id} 
                          media={m} 
                          projectName={proj.title}
                          onClick={() => setLightbox({ url: m.url, type: m.type, projectName: proj.title })}
                        />
                      ))
                    ) : (
                      <div className="empty-media">No Media</div>
                    )}
                  </div>
               </div>
             ))}
           </div>
        ) : (
           // Filtered Media View (Gallery Mode)
           <div className="horizontal-scroll-container media-gallery">
             {filteredMedia.length > 0 ? (
               filteredMedia.map((item, idx) => (
                 <ProjectMediaItem 
                   key={idx} 
                   media={item.media} 
                   projectName={item.project.title}
                   onClick={() => setLightbox({ url: item.media.url, type: item.media.type, projectName: item.project.title })}
                 />
               ))
             ) : (
               <div style={{ padding: '2rem', color: '#666' }}>No media found for this filter.</div>
             )}
           </div>
        )}

      </Section>

      <Section id="experience" title="Experience">
        <div className="experience-grid">
          {data.experience.map((exp) => (
            <div key={exp.id} className="glass-card">
              <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }}>{exp.dates}</span>
              <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0', fontWeight: 700 }}>{exp.role}</h3>
              <div style={{ color: '#888', marginBottom: '1rem', fontSize: '1rem' }}>{exp.company}</div>
              <p style={{ color: '#aaa', whiteSpace: 'pre-line' }}>{exp.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ height: '4rem' }}></div>

      {lightbox && (
        <Lightbox 
          mediaUrl={lightbox.url} 
          mediaType={lightbox.type} 
          projectName={lightbox.projectName}
          onClose={() => setLightbox(null)} 
        />
      )}
      {showContact && <ContactModal profile={data.profile} onClose={() => setShowContact(false)} />}
    </>
  );
};

// --- Admin Panel ---

const AdminPanel = ({ data, onUpdate }: { data: ResumeData; onUpdate: (d: ResumeData) => void }) => {
  const [activeTab, setActiveTab] = useState<"profile" | "experience" | "skills" | "portfolio">("profile");

  const updateData = (newData: ResumeData) => onUpdate(newData);
  
  const handleProfileChange = (e: any) => updateData({ ...data, profile: { ...data.profile, [e.target.name]: e.target.value } });
  const handleAvatar = async (e: any) => e.target.files[0] && updateData({ ...data, profile: { ...data.profile, avatarUrl: await fileToBase64(e.target.files[0]) } });
  const handleQr = async (e: any) => e.target.files[0] && updateData({ ...data, profile: { ...data.profile, wechatQrUrl: await fileToBase64(e.target.files[0]) } });
  
  const addExp = () => updateData({ ...data, experience: [...data.experience, { id: generateId(), role: "Role", company: "Company", dates: "Dates", description: "Desc" }] });
  const updateExp = (id: string, field: string, val: string) => updateData({ ...data, experience: data.experience.map(e => e.id === id ? { ...e, [field]: val } : e) });
  const delExp = (id: string) => updateData({ ...data, experience: data.experience.filter(e => e.id !== id) });
  
  // Project Management
  const addProj = () => updateData({ ...data, projects: [...data.projects, { id: generateId(), title: "New Project", description: "Desc", media: [], attachments: [] }] });
  const updateProj = (id: string, field: string, val: any) => updateData({ ...data, projects: data.projects.map(p => p.id === id ? { ...p, [field]: val } : p) });
  const delProj = (id: string) => updateData({ ...data, projects: data.projects.filter(p => p.id !== id) });
  
  // Media Upload Handler
  const handleAddMedia = async (projectId: string, e: any) => {
      if (e.target.files && e.target.files.length > 0) {
          const newMediaItems: ProjectMedia[] = [];
          for (let i = 0; i < e.target.files.length; i++) {
              const file = e.target.files[i];
              const base64 = await fileToBase64(file);
              newMediaItems.push({
                  id: generateId(),
                  type: file.type.startsWith('video') ? 'video' : 'image',
                  url: base64
              });
          }
          updateData({ 
              ...data, 
              projects: data.projects.map(p => 
                  p.id === projectId ? { ...p, media: [...p.media, ...newMediaItems] } : p
              ) 
          });
      }
  };

  const removeMedia = (projectId: string, mediaId: string) => {
      updateData({
          ...data,
          projects: data.projects.map(p => 
              p.id === projectId ? { ...p, media: p.media.filter(m => m.id !== mediaId) } : p
          )
      });
  };

  const handleAtt = async (id: string, e: any) => {
      if (e.target.files[0]) {
          const file = e.target.files[0];
          const att = { name: file.name, url: await fileToBase64(file) };
          updateData({ ...data, projects: data.projects.map(p => p.id === id ? { ...p, attachments: [...p.attachments, att] } : p) });
      }
  };
  const delAtt = (pid: string, idx: number) => updateData({ ...data, projects: data.projects.map(p => p.id === pid ? { ...p, attachments: p.attachments.filter((_, i) => i !== idx) } : p) });

  return (
    <div className="admin-panel fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem', overflowX: 'auto' }}>
            {['profile', 'experience', 'skills', 'portfolio'].map(t => (
                <button key={t} onClick={() => setActiveTab(t as any)} style={{ background: 'none', border: 'none', color: activeTab === t ? 'var(--accent)' : '#666', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{t}</button>
            ))}
        </div>

        {activeTab === 'profile' && (
            <div>
                <div className="form-grid">
                    <div><label>Name</label><input name="name" value={data.profile.name} onChange={handleProfileChange} /></div>
                    <div><label>Title</label><input name="title" value={data.profile.title} onChange={handleProfileChange} /></div>
                </div>
                <label>Summary</label><textarea name="summary" rows={4} value={data.profile.summary} onChange={handleProfileChange} />
                <div className="form-grid">
                    <div><label>Email</label><input name="email" value={data.profile.email} onChange={handleProfileChange} /></div>
                    <div><label>WeChat ID</label><input name="wechatId" value={data.profile.wechatId} onChange={handleProfileChange} /></div>
                    <div><label>Phone</label><input name="phone" value={data.profile.phone} onChange={handleProfileChange} /></div>
                    <div><label>Location</label><input name="location" value={data.profile.location} onChange={handleProfileChange} /></div>
                </div>
                <label>Avatar</label><input type="file" onChange={handleAvatar} />
                <label>WeChat QR</label><input type="file" onChange={handleQr} />
            </div>
        )}

        {activeTab === 'experience' && (
            <div>
                {data.experience.map(e => (
                    <div key={e.id} style={{ border: '1px solid #333', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
                        <input value={e.role} onChange={ev => updateExp(e.id, 'role', ev.target.value)} placeholder="Role" />
                        <input value={e.company} onChange={ev => updateExp(e.id, 'company', ev.target.value)} placeholder="Company" />
                        <input value={e.dates} onChange={ev => updateExp(e.id, 'dates', ev.target.value)} placeholder="Dates" />
                        <textarea value={e.description} onChange={ev => updateExp(e.id, 'description', ev.target.value)} rows={3} />
                        <button onClick={() => delExp(e.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </div>
                ))}
                <button className="btn btn-outline" onClick={addExp}>+ Add Job</button>
            </div>
        )}

        {activeTab === 'portfolio' && (
            <div>
                 {data.projects.map(p => (
                    <div key={p.id} style={{ border: '1px solid #333', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
                        <input value={p.title} onChange={ev => updateProj(p.id, 'title', ev.target.value)} placeholder="Title" />
                        <textarea value={p.description} onChange={ev => updateProj(p.id, 'description', ev.target.value)} placeholder="Description" />
                        <input value={p.linkUrl || ''} onChange={ev => updateProj(p.id, 'linkUrl', ev.target.value)} placeholder="External Link" />
                        
                        <label>Media Gallery</label>
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '10px 0', border: '1px dashed #333', borderRadius: 8, marginBottom: '1rem' }}>
                            {p.media.length > 0 ? p.media.map(m => (
                                <div key={m.id} style={{ flexShrink: 0, width: 100, height: 100, position: 'relative', background: '#000' }}>
                                    {m.type === 'video' ? <video src={m.url} style={{ width:'100%', height:'100%', objectFit:'cover'}} /> : <img src={m.url} style={{ width:'100%', height:'100%', objectFit:'cover'}} />}
                                    <button onClick={() => removeMedia(p.id, m.id)} style={{ position:'absolute', top:0, right:0, background:'red', color:'white', border:'none', cursor:'pointer' }}>&times;</button>
                                </div>
                            )) : <div style={{ padding: '0 1rem', color: '#666' }}>No media uploaded</div>}
                        </div>
                        <input type="file" multiple accept="image/*,video/*" onChange={(e) => handleAddMedia(p.id, e)} />
                        
                        <label style={{marginTop: '1rem'}}>Attachments</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {p.attachments.map((att, idx) => (
                                <div key={idx} style={{ background: '#333', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{att.name} <span onClick={() => delAtt(p.id, idx)} style={{cursor:'pointer', color:'red'}}>&times;</span></div>
                            ))}
                        </div>
                        <input type="file" onChange={(e) => handleAtt(p.id, e)} />
                        
                        <button onClick={() => delProj(p.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>Delete Project</button>
                    </div>
                 ))}
                 <button className="btn btn-outline" onClick={addProj}>+ Add Project</button>
            </div>
        )}

        {activeTab === 'skills' && (
             <div>
                 <textarea 
                    value={data.skills.join(', ')} 
                    onChange={e => updateData({...data, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                    placeholder="React, Design, ..."
                 />
                 <small style={{ color: '#666' }}>Comma separated values</small>
             </div>
        )}
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_DATA);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("my_portfolio_data_v3"); // Version bump for schema change
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse data");
      }
    }
  }, []);

  const handleUpdate = (newData: ResumeData) => {
    setResumeData(newData);
    localStorage.setItem("my_portfolio_data_v3", JSON.stringify(newData));
  };

  if (!isClient) return null;

  return (
    <>
      {isEditing ? (
        <div className="container" style={{ paddingTop: '2rem' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Edit Portfolio</h1>
          <AdminPanel data={resumeData} onUpdate={handleUpdate} />
        </div>
      ) : (
        <ResumeView data={resumeData} />
      )}

      {/* Toggle Button */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 3000 }}>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="btn-icon"
          style={{ width: 60, height: 60, background: 'var(--accent)', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: 'black' }}
        >
          {isEditing ? <IconEye /> : <IconEdit />}
        </button>
      </div>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);