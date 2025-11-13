import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMemberById, 
  getPublicationsByMember, 
  getConferencesByMember, 
  addConference, 
  updateMember, 
  uploadMemberPhoto,
  updatePublicationTags,
  getPublicationMetadata,
  updatePublicationType,
  getOpenAlexWorkTypes,
  getMemberCountsByYear // Grafik için
} from '../services/api';
// Gerekli 'type' importunu ekleyin (TS hatası için)
import type { YearCount } from '../services/api';
import { 
  DocumentTextIcon, 
  CalendarIcon, 
  PlusCircleIcon, 
  XMarkIcon, 
  PencilIcon, 
  TagIcon,
  CheckIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import ScrollAnimation from '../components/ScrollAnimation';
// Grafik bileşenini import edin
import MemberChart from '../components/MemberChart'; 

import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';

// Tipler
interface Member {
  id: number;
  name: string;
  description: string | null;
  photoPath: string | null;
  citedByCount: number;
  worksCount: number;
}

interface Publication {
  id: number;
  title: string;
  identifierUrl: string;
  citedByCount: number;
  authors: string;
  publicationYear: number | null;
  type: string | null;
  tags: string[];
  sourceName: string | null;
}

interface Conference {
  id: number;
  name: string;
  year: number;
  location: string;
  description: string;
}

interface PageData<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

interface PublicationMetadata {
  types: string[];
  tags: string[];
}

// Yıla göre gruplanmış veriler için tip
type GroupedPublications = {
  [year: string]: Publication[];
};


// ============================================================================
// QuillEditor bileşeni (DEĞİŞİKLİK YOK)
interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}

const QuillEditor = ({ value, onChange, placeholder }: QuillEditorProps) => {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link'],
            ['clean']
        ],
    };
    const { quill, quillRef } = useQuill({ theme: 'snow', modules, placeholder });
    
    useEffect(() => {
        if (quill) {
            quill.on('text-change', (_delta, _oldDelta, source) => {
                if (source === 'user') {
                    onChange(quill.root.innerHTML);
                }
            });
        }
    }, [quill, onChange]);

    useEffect(() => {
        if (quill && value !== quill.root.innerHTML) {
            quill.clipboard.dangerouslyPasteHTML(0, value || '');
        }
    }, [quill, value]);

    return (
        <div style={{ width: '100%', height: '200px' }}>
            <div ref={quillRef} />
        </div>
    );
};
// ============================================================================


function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sort, setSort] = useState('publicationYear');

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false); // Varsayılan olarak kapalı

  const [openConferenceDialog, setOpenConferenceDialog] = useState(false);
  const [openMemberEditDialog, setOpenMemberEditDialog] = useState(false);
  const [editingPub, setEditingPub] = useState<Publication | null>(null);

  const [conferenceForm, setConferenceForm] = useState({ name: '', year: '', location: '', description: '' });
  const [memberForm, setMemberForm] = useState<{description: string, photo: File | null}>({ description: '', photo: null });
  
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [currentType, setCurrentType] = useState<string>('');
  
  const [openYear, setOpenYear] = useState<string | null>(null);


  const publicationsSectionRef = useRef<HTMLElement>(null);
  const isInitialMount = useRef(true);

  const isYearSort = sort === 'publicationYear' || sort === 'publicationYearAsc';

  useEffect(() => {
    if (isInitialMount.current || isYearSort) {
      isInitialMount.current = false;
      return;
    }
    publicationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page, isYearSort]);

  useEffect(() => {
    setPage(1);
  }, [selectedTypes, selectedTags, sort, pageSize]);
  

  const queryClient = useQueryClient();
  
  const queryPage = isYearSort ? 0 : page - 1; 
  const queryPageSize = isYearSort ? 9999 : pageSize; 
  

  const { data: member, isLoading: memberLoading, error: memberError } = useQuery<Member, Error>({
    queryKey: ['member', id],
    queryFn: () => getMemberById(id!),
  });

  const { data: publicationsData, isLoading: pubLoading, error: pubError } = useQuery<PageData<Publication>, Error>({
    queryKey: ['publications', id, queryPage, queryPageSize, sort, selectedTypes, selectedTags],
    queryFn: () => getPublicationsByMember(id!, queryPage, queryPageSize, sort, selectedTypes, selectedTags),
    placeholderData: (previousData) => previousData,
  });

  const { data: pubMetadata } = useQuery<PublicationMetadata, Error>({
    queryKey: ['publicationMetadata', id],
    queryFn: () => getPublicationMetadata(id!),
  });

  const { data: openAlexTypes, isLoading: isLoadingTypes } = useQuery<string[], Error>({
    queryKey: ['openAlexWorkTypes'],
    queryFn: getOpenAlexWorkTypes,
    staleTime: 1000 * 60 * 60 * 24, 
    refetchOnWindowFocus: false,
  });

  // YENİ: Grafik verisi için sorgu
  const { data: chartData, isLoading: isChartLoading } = useQuery<YearCount[], Error>({
    queryKey: ['memberCountsByYear', id],
    queryFn: () => getMemberCountsByYear(id!),
    staleTime: 1000 * 60 * 60, // 1 saat cache
    enabled: !!member, // Sadece 'member' yüklendikten sonra çalış
  });

  const { data: conferences, isLoading: confLoading, error: confError } = useQuery<Conference[], Error>({
    queryKey: ['conferences', id],
    queryFn: () => getConferencesByMember(id!),
  });

  
  const groupedPublications = useMemo(() => {
    if (!isYearSort || !publicationsData?.content) {
      return null;
    }
    
    const groups = publicationsData.content.reduce((acc, pub) => {
      const yearKey = pub.publicationYear ? pub.publicationYear.toString() : 'Unknown Year';
      if (!acc[yearKey]) {
        acc[yearKey] = [];
      }
      acc[yearKey].push(pub);
      return acc;
    }, {} as GroupedPublications);

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Unknown Year') return 1;
      if (b === 'Unknown Year') return -1;
      
      if (sort === 'publicationYearAsc') {
        return parseInt(a) - parseInt(b);
      }
      return parseInt(b) - parseInt(a);
    });

    return { groups, sortedKeys };

  }, [isYearSort, publicationsData, sort]);
  

  useEffect(() => {
    // TypeScript 'null' hatasını düzelt
    if (isYearSort && groupedPublications && groupedPublications.sortedKeys.length > 0) {
      if (!openYear || !groupedPublications.sortedKeys.includes(openYear)) {
          setOpenYear(groupedPublications.sortedKeys[0]);
      }
    } else {
      setOpenYear(null);
    }
  }, [isYearSort, groupedPublications]);


  // Mutation'lar
  const addConferenceMutation = useMutation({
    mutationFn: (conference: { name: string; year: number; location: string; description: string }) =>
      addConference(id!, conference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conferences', id] });
      setOpenConferenceDialog(false);
      setConferenceForm({ name: '', year: '', location: '', description: '' });
    },
    onError: (error: Error) => {
      console.error("Add conference error:", error);
      alert(`Add conference error: ${error.message}`);
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: (updatedMember: { description?: string }) => {
      return updateMember(id!, updatedMember);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      setOpenMemberEditDialog(false);
      setMemberForm({ description: '', photo: null });
    },
    onError: (error: Error) => {
      console.error("Update member error:", error);
      alert(`Update member error: ${error.message}`);
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => uploadMemberPhoto(id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      setOpenMemberEditDialog(false);
      setMemberForm({ description: '', photo: null });
    },
    onError: (error: Error) => {
      console.error("Upload photo error:", error);
      alert(`Upload photo error: ${error.message}`);
    },
  });

  const updateTagsMutation = useMutation({
    mutationFn: ({ pubId, tags }: { pubId: number, tags: string[] }) => updatePublicationTags(pubId, tags),
    onSuccess: (updatedPublication) => {
      queryClient.setQueryData<PageData<Publication> | undefined>(
        ['publications', id, queryPage, queryPageSize, sort, selectedTypes, selectedTags],
        (oldData) => {
          if (!oldData) return oldData;
          const newContent = oldData.content.map(pub =>
            pub.id === updatedPublication.id ? updatedPublication : pub
          );
          return { ...oldData, content: newContent };
        }
      );
    },
    onError: (error: Error) => {
      console.error("Update tags error:", error);
      alert(`Tag update error: ${error.message}`);
    },
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ pubId, type }: { pubId: number, type: string }) => updatePublicationType(pubId, type),
    onSuccess: (updatedPublication) => {
      queryClient.setQueryData<PageData<Publication> | undefined>(
        ['publications', id, queryPage, queryPageSize, sort, selectedTypes, selectedTags],
        (oldData) => {
          if (!oldData) return oldData;
          const newContent = oldData.content.map(pub =>
            pub.id === updatedPublication.id ? updatedPublication : pub
          );
          return { ...oldData, content: newContent };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['publicationMetadata', id] });
    },
    onError: (error: Error) => {
      console.error("Update type error:", error);
      alert(`Type update error: ${error.message}`);
    },
  });


  // ============================================================================
  // YARDIMCI FONKSİYONLAR
  // ============================================================================

  const handleConferenceDialogOpen = () => setOpenConferenceDialog(true);
  const handleConferenceDialogClose = () => {
    setOpenConferenceDialog(false);
    setConferenceForm({ name: '', year: '', location: '', description: '' });
  };
  
  const handleMemberEditDialogOpen = () => {
    if (!member) return;
    setMemberForm({ description: member.description || '', photo: null });
    setOpenMemberEditDialog(true);
  };
  
  const handleMemberEditDialogClose = () => {
    setOpenMemberEditDialog(false);
    setMemberForm({ description: '', photo: null });
  };
  
  const handleConferenceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setConferenceForm({ ...conferenceForm, [e.target.name]: e.target.value });
  };
  
  const handleDescriptionChange = (value: string) => {
    setMemberForm(prev => ({ ...prev, description: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMemberForm({ ...memberForm, photo: e.target.files[0] });
    }
  };

  const handleAddConference = () => {
    if (!conferenceForm.name || !conferenceForm.year) {
      alert('Name and year are required fields.');
      return;
    }
    addConferenceMutation.mutate({
      name: conferenceForm.name,
      year: parseInt(conferenceForm.year),
      location: conferenceForm.location,
      description: conferenceForm.description,
    });
  };

  const handleUpdateMember = () => {
    let descriptionToSave = memberForm.description;
    if (descriptionToSave) {
        descriptionToSave = descriptionToSave.replace(/<p><br><\/p>/g, '');
    }
    const isDescriptionEmpty = !descriptionToSave || descriptionToSave.replace(/<(.|\n)*?>/g, '').trim().length === 0;
    
    if (isDescriptionEmpty && !memberForm.photo) {
        if (!memberForm.photo) {
             alert('Please write a description or select a photo.');
             return;
        }
    }
    
    if (descriptionToSave !== (member?.description || '')) {
        updateMemberMutation.mutate({ description: descriptionToSave });
    }
    
    if (memberForm.photo) {
        uploadPhotoMutation.mutate(memberForm.photo);
    }
  };

  const handlePageChange = (value: number) => setPage(value);
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(event.target.value));
  };
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(event.target.value);
  };
  
  const truncateAuthors = (authors: string) => {
    if (authors.length > 120) {
      return authors.substring(0, 100) + '... and others';
    }
    return authors;
  };
  
  const handleTypeToggle = (typeToToggle: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeToToggle)
        ? prev.filter(t => t !== typeToToggle)
        : [...prev, typeToToggle]
    );
  };

  const handleTagToggle = (tagToToggle: string) => {
    setSelectedTags(prev =>
      prev.includes(tagToToggle)
        ? prev.filter(t => t !== tagToToggle)
        : [...prev, tagToToggle]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedTypes([]);
  };

  const handleOpenEditModal = (pub: Publication) => {
    setEditingPub(pub);
    setCurrentTags(pub.tags || []);
    setCurrentType(pub.type || 'other');
    setTagInput('');
  };

  const handleCloseEditModal = () => {
    setEditingPub(null);
    setCurrentTags([]);
    setTagInput('');
    setCurrentType('');
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      setCurrentTags([...currentTags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleSavePublicationDetails = async () => {
    if (!editingPub) return;
    const promises = [];
    const tagsChanged = JSON.stringify(editingPub.tags.sort()) !== JSON.stringify(currentTags.sort());
    if (tagsChanged) {
      promises.push(updateTagsMutation.mutateAsync({ pubId: editingPub.id, tags: currentTags }));
    }
    if (editingPub.type !== currentType) {
      promises.push(updateTypeMutation.mutateAsync({ pubId: editingPub.id, type: currentType }));
    }
    if (promises.length > 0) {
      try {
        await Promise.all(promises);
        handleCloseEditModal();
      } catch (error) {
        console.error("Failed to save publication details", error);
      }
    } else {
      handleCloseEditModal();
    }
  };

  // ============================================================================
  // YAYIN KARTI ALT BİLEŞENİ
  // ============================================================================
  const PublicationCard = ({ pub, index, animationDelay = 100 }: { pub: Publication; index: number; animationDelay?: number }) => {
    return (
      <ScrollAnimation key={pub.id} animationType="fade-up" delay={index * animationDelay}>
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
          <div className="flex items-start space-x-3 flex-1">
            <DocumentTextIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className='flex-1'>
              <a href={pub.identifierUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline text-lg">{pub.title}</a>
              {pub.sourceName && (
                <p className="text-gray-600 text-sm mt-2 break-words" title={pub.sourceName}>
                  <span className="font-medium">Source:</span> {pub.sourceName}
                </p>
              )}
              <p className="text-gray-600 text-sm mt-2 break-words overflow-auto max-w-full whitespace-normal" title={pub.authors}><span className="font-medium">Authors:</span> {truncateAuthors(pub.authors)}</p>
              <div className='mt-3 space-y-1'>
                <p className="text-gray-600 text-sm" title={pub.publicationYear ? '' : 'Yıl bilgisi mevcut değil'}><span className="font-medium">Year:</span> {pub.publicationYear ?? 'Bilinmeyen Yıl'}</p>
                <p className="text-gray-600 text-sm"><span className="font-medium">Number of Citations:</span> {pub.citedByCount}</p>
                {pub.type && (
                  <p className="text-gray-600 text-sm capitalize"><span className="font-medium">Type:</span> {pub.type.replace("_", " ")}</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                <TagIcon className="h-4 w-4 mr-1.5 text-blue-600"/>
                Tags
              </h4>
              <button 
                onClick={() => handleOpenEditModal(pub)}
                className="p-1 text-gray-400 hover:text-blue-600 rounded-full transition-colors" 
                title="Edit Tags and Type"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            {pub.tags && pub.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {pub.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No tags.</p>
            )}
          </div>
        </div>
      </ScrollAnimation>
    );
  };

  // ============================================================================
  // RENDER BAŞLANGICI
  // ============================================================================

  if (memberLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
    </div>
  );
  if (memberError) return (
    <div className="text-red-500 text-center text-xl mt-12 font-medium">
      Error: {memberError.message}
    </div>
  );
  if (!member) return (
    <div className="text-red-500 text-center text-xl mt-12 font-medium">
      No member found.
    </div>
  );

  const totalFilters = selectedTags.length + selectedTypes.length;


  return (
    <div className="p-4 sm:p-6 w-full min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      
      {/* Üye Bilgisi Section'ı (GÜNCELLENDİ) */}
      <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Sol Taraf: Fotoğraf */}
          <div className="flex-shrink-0">
            {member.photoPath ? (
              <img
                 src={`http://localhost:8080/uploads/${member.photoPath}`}
                alt="Member Photo"
                className="w-32 h-32 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Photo
              </div>
            )}
          </div>
          
          {/* Orta: İsim ve Açıklama */}
          <div className="flex-1 md:max-w-full text-center sm:text-left min-w-0"> {/* <-- min-w-0 eklendi */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">{member.name}</h1>
            {member.description && (
          <div 
                className="prose max-w-none text-gray-600 mb-4 member-description break-words"
                dangerouslySetInnerHTML={{ __html: member.description || '' }}
              />
            )}
            <button
              onClick={handleMemberEditDialogOpen} 
              className="flex items-center justify-center sm:justify-start px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mx-auto sm:mx-0"
            >
               <PencilIcon className="h-5 w-5 mr-2" />
              Edit Profile
            </button>
          </div>

          {/* YENİ: Sağ Taraf (Grafik) */}
          <div className="w-full sm:w-auto sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg flex-1 mt-6 sm:mt-0">
            {isChartLoading ? (
              <div className="h-[150px] w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                <span>Loading Chart...</span>
              </div>
            ) : chartData && chartData.length > 0 ? (
              <MemberChart data={chartData} />
            ) : (
              <div className="h-[150px] w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm p-4">
                <span>No publication data by year found.</span>
              </div>
            )}
          </div>

        </div>
        
        {/* Alt: İstatistikler */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 border-t border-gray-100 pt-6">
            <p className="text-gray-600 text-lg flex items-center justify-center sm:justify-start">
              <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-semibold">Number of Citations:</span> {member.citedByCount}
            </p>
            <p className="text-gray-600 text-lg flex items-center justify-center sm:justify-start">
              <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-semibold">Number of Publications:</span> {member.worksCount}
            </p>
        </div>
      </section>

      {/* Yayınlar Section'ı */}
      <ScrollAnimation animationType="fade-up" delay={100}>
        <section ref={publicationsSectionRef} className="mb-10">
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
               <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-2" />
              Publications
            </h2>
            <div className="flex items-center gap-4">
              <select
                value={sort}
                onChange={handleSortChange}
                 className="border rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="publicationYear">Year (Newest First)</option>
                <option value="publicationYearAsc">Year (Oldest First)</option>
                <option value="citedByCount">Citations (Highest First)</option>
                 <option value="citedByCountAsc">Citations (Lowest First)</option>
                <option value="id">Default (ID)</option>
              </select>
              
              {/* YENİ: PageSize seçimi sadece yıl sıralaması aktif DEĞİLSE gösterilir */}
              {!isYearSort && (
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange} 
                  className="border rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={36}>36</option>
                </select>
              )}
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <button 
              onClick={() => setShowFilters(prev => !prev)}
              className="flex justify-between items-center w-full"
            >
               <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Filters
                  {totalFilters > 0 && (
                     <span className="ml-2 px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">
                      {totalFilters}
                    </span>
                  )}
                </h3>
               </div>
              {showFilters ? <ChevronUpIcon className="h-6 w-6 text-gray-600" /> : <ChevronDownIcon className="h-6 w-6 text-gray-600" />}
            </button>
            
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {pubMetadata && (pubMetadata.types.length > 0 || pubMetadata.tags.length > 0) ? (
                  <>
                    {pubMetadata.types.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2">By Type</h4>
                         <div className="flex flex-wrap gap-2">
                          {pubMetadata.types.map(type => (
                            <button
                              key={type}
                               onClick={() => handleTypeToggle(type)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
                                selectedTypes.includes(type)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                               {type.replace("_", " ")}
                            </button>
                          ))}
                         </div>
                      </div>
                    )}
                    
                    {pubMetadata.tags.length > 0 && (
                       <div>
                        <h4 className="font-semibold text-gray-700 mb-2">By Tag</h4>
                        <div className="flex flex-wrap gap-2">
                          {pubMetadata.tags.map(tag => (
                             <button
                              key={tag}
                              onClick={() => handleTagToggle(tag)}
                               className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                selectedTags.includes(tag)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                               {tag}
                            </button>
                          ))}
                       </div>
                      </div>
                    )}
                    
                    {totalFilters > 0 && (
                     <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:underline mt-4"
                      >
                         Clear All Filters
                      </button>
                    )}
                  </>
                ) : (
                 <p className="text-gray-500 text-sm">No filter options available for this member.</p>
                )}
              </div>
            )}
          </div>

          
          {/* GÜNCELLENDİ: Yayın Listesi (Koşullu Render) */}
          {pubLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
            </div>
          ) : pubError ? (
            <div className="text-red-500 text-center text-lg py-6">
              Error: {pubError.message}
            </div>
          ) : (
            <>
              {/* === KOŞULLU RENDER === */}
              {isYearSort && groupedPublications ? (
                
                /* ============= 1. YILA GÖRE GRUPLU GÖRÜNÜM (YENİ) ============= */
                <div className="space-y-4">
                  {groupedPublications.sortedKeys.map(year => (
                    <div key={year} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Yıl Başlığı (Accordion Toggle) */}
                      <button
                        onClick={() => setOpenYear(openYear === year ? null : year)}
                        className="w-full flex justify-between items-center p-4 sm:p-5 hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="text-xl sm:text-2xl font-semibold text-blue-700">
                          {year}
                          <span className="text-gray-500 font-normal text-lg ml-3">
                            ({groupedPublications.groups[year].length} publications)
                          </span>
                        </h3>
                        {openYear === year ? (
                          <ChevronUpIcon className="h-6 w-6 text-blue-700" />
                        ) : (
                          <ChevronDownIcon className="h-6 w-6 text-gray-600" />
                        )}
                      </button>

                      {/* Açılır Kapanır İçerik */}
                      {openYear === year && (
                        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50/50">
                          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {groupedPublications.groups[year].map((pub: Publication, index: number) => (
                              // Kartı çağır (daha kısa animasyon gecikmesiyle)
                              <PublicationCard key={pub.id} pub={pub} index={index} animationDelay={50} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              ) : (

                /* ============= 2. NORMAL (SAYFALAMALI) GÖRÜNÜM (ESKİ) ============= */
                publicationsData && publicationsData.content && publicationsData.content.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-gray-600 text-lg">
                        Showing {publicationsData.content.length} of {publicationsData.totalElements} results
                      </p>
                    </div>
                    
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {publicationsData.content.map((pub: Publication, index: number) => (
                        // Kartı çağır (standart animasyon gecikmesiyle)
                        <PublicationCard key={pub.id} pub={pub} index={index} />
                      ))}
                    </div>
                    
                    {/* Pagination (Sadece 'isYearSort' false ise gösterilir) */}
                    {!isYearSort && (
                      <div className="mt-8 flex justify-center space-x-3">
                        {Array.from({ length: publicationsData.totalPages }, (_, i) => i + 1).map((pageNum: number) => (
                          <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === pageNum ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{pageNum}</button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600 text-center text-lg py-6">
                    {totalFilters > 0 ? 'No publications found matching your filters.' : 'No publications found.'}
                  </p>
                )
              )}
            </>
          )}
        </section>
      </ScrollAnimation>

      {/* Konferanslar Section'ı (DEĞİŞİKLİK YOK) */}
      <ScrollAnimation animationType="fade-up" delay={300}>
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
               <CalendarIcon className="h-8 w-8 text-blue-600 mr-2" />
              Conferences
            </h2>
            <button
              onClick={handleConferenceDialogOpen} 
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Add New Conference
            </button>
          </div>
          {confLoading ? (
            <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div></div>
          ) : confError ? (
            <div className="text-red-500 text-center text-lg py-6">Error: {confError.message}</div>
          ) : conferences && conferences.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {conferences.map((conf, index) => (
                 <ScrollAnimation key={conf.id} animationType="fade-up" delay={index * 100}>
                   <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full">
                       <div className="flex items-start space-x-3">
                       <CalendarIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                       <div>
                         <h3 className="text-lg font-semibold text-gray-800">{conf.name}</h3>
                          <p className="text-gray-600 text-sm mt-2"><span className="font-medium">Year:</span> {conf.year}</p>
                         <p className="text-gray-600 text-sm mt-1"><span className="font-medium">Location:</span> {conf.location || 'Not specified'}</p>
                         {conf.description && (<p className="text-gray-600 text-sm mt-1 break-words overflow-auto max-w-full whitespace-normal"><span className="font-medium">Description:</span> {conf.description}</p>)}
                         </div>
                     </div>
                   </div>
                  </ScrollAnimation>
              ))}
            </div>
           ) : (
            <p className="text-gray-600 text-center text-lg py-6">No conferences found.</p>
          )}
        </section>
      </ScrollAnimation>
      
      {/* Konferans Ekleme Modalı (DEĞİŞİKLİK YOK) */}
      {openConferenceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-300 scale-100">
             <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">Add New Conference</h2><button onClick={handleConferenceDialogClose}><XMarkIcon className="h-6 w-6 text-gray-600 hover:text-gray-800 transition-colors" /></button></div>
            <div className="space-y-5">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Conference Name</label><input type="text" name="name" placeholder="Conference Name" value={conferenceForm.name} onChange={handleConferenceFormChange} className="w-full border rounded-lg px-4 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" required /></div>
               <div><label className="block text-sm font-medium text-gray-700 mb-1">Year</label><input type="number" name="year" placeholder="Year" value={conferenceForm.year} onChange={handleConferenceFormChange} className="w-full border rounded-lg px-4 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><input type="text" name="location" placeholder="Location" value={conferenceForm.location} onChange={handleConferenceFormChange} className="w-full border rounded-lg px-4 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" placeholder="Description" value={conferenceForm.description} onChange={handleConferenceFormChange} className="w-full border rounded-lg px-4 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" rows={4} /></div>
            </div>
            <div className="mt-6 flex justify-end space-x-3"><button onClick={handleConferenceDialogClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">Cancel</button><button onClick={handleAddConference} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Add</button></div>
          </div>
        </div>
      )}
      
{/* Profil Düzenleme Modalı */}
      {openMemberEditDialog && (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2><button onClick={handleMemberEditDialogClose}><XMarkIcon className="h-6 w-6 text-gray-600 hover:text-gray-800 transition-colors" /></button></div>
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <QuillEditor
                   value={memberForm.description}
                    onChange={handleDescriptionChange}
                    placeholder="Biography or description..."
                />
              </div>
              
              {/* --- DÜZELTME BURADA: Üst kısma boşluk için mt-4 eklendi --- */}
              <div className="pt-8 mt-4"> 
                <label className="block text-sm font-medium text-gray-700 mb-3">Upload Photo</label>
                <input type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="w-full border rounded-lg px-4 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
              </div>
              {/* --- DÜZELTME BİTİŞİ --- */}
              
             </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button onClick={handleMemberEditDialogClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">Cancel</button>
              <button onClick={handleUpdateMember} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Save</button>
            </div>
          </div>
         </div>
      )}
      
      {/* YAYIN DÜZENLEME MODALI (Dinamik 'Type' Listesi) (DEĞİŞİKLİK YOK) */}
      {editingPub && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Edit Publication</h2>
              <button onClick={handleCloseEditModal}>
                <XMarkIcon className="h-6 w-6 text-gray-600 hover:text-gray-800 transition-colors" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2" title={editingPub.title}>
               <span className="font-medium">Publication:</span> {editingPub.title}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Publication Type</label>
              <select
                 value={currentType}
                onChange={(e) => setCurrentType(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                disabled={isLoadingTypes}
              >
                 {isLoadingTypes ? (
                  <option value="">Loading types...</option>
                ) : (
                   Array.from(new Set([currentType, ...(openAlexTypes || [])]))
                    .filter(Boolean) 
                    .sort()
                    .map(typeOpt => (
                       <option key={typeOpt} value={typeOpt} className="capitalize">
                        {typeOpt.replace(/_/g, " ")}
                      </option>
                  ))
                )}
               </select>
            </div>
            
            <hr className="my-4"/>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
               <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Add a new tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 border rounded-lg px-4 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <button 
                  onClick={handleAddTag} 
                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add
                </button>
              </div>

               <div className="min-h-[100px] max-h-[200px] overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-3">
                {currentTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentTags.map((tag: string) => ( 
                      <span 
                        key={tag} 
                         className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {tag}
                        <button 
                           onClick={() => handleRemoveTag(tag)}
                          className="ml-1.5 p-0.5 rounded-full text-blue-600 hover:bg-blue-200"
                          title={`Remove ${tag}`}
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                     ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-6">No tags added yet.</p>
                )}
              </div>
             </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={handleCloseEditModal} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                 Cancel
              </button>
              <button 
                onClick={handleSavePublicationDetails}
                disabled={updateTagsMutation.isPending || updateTypeMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center disabled:bg-gray-400"
              >
                {(updateTagsMutation.isPending || updateTypeMutation.isPending) ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckIcon className="h-5 w-5 mr-1" />
                )}
                Save
               </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default MemberDetailPage;