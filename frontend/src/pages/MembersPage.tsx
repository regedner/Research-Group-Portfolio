import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { fetchMembers, fetchNewMember } from '../services/api';
import ScrollAnimation from '../components/ScrollAnimation';

function MembersPage() {
  const [sourceId, setSourceId] = useState('');
  const [providerType, setProviderType] = useState('openalex');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFetchingMember, setIsFetchingMember] = useState(false);

  const { data: members, isLoading, error, refetch } = useQuery<MemberPageData, Error>({
    queryKey: ['members'],
    queryFn: () => fetchMembers(),
  });

  interface Member {
    id: number;
    name: string;
    description: string | null;
    photoPath: string | null;
    citedByCount: number;
    worksCount: number;
  }

  interface MemberPageData {
    content: Member[];
    totalPages: number;
    totalElements: number;
  }

  const handleFetchMember = async () => {
    setIsFetchingMember(true);
    try {
      await fetchNewMember(sourceId, providerType);
      refetch();
      setSourceId('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Error fetching member:', err);
    } finally {
      setIsFetchingMember(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-red-500 text-center text-lg sm:text-xl">
          Error loading members: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Section - Mobil Optimize */}
      <div className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">Members</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              {showAddForm ? (
                <>
                  <XMarkIcon className="h-5 w-5" />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-5 w-5" />
                  <span>Add Member</span>
                </>
              )}
            </button>
          </div>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">
            Meet our research team members
          </p>
        </div>
      </div>

      {/* Add Member Form - Mobil Optimize */}
      {showAddForm && (
        <div className="w-full bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Add New Member</h3>
              <div className="flex flex-col gap-3 sm:gap-4">
                <div>
                  <label htmlFor="source-id" className="sr-only">Source ID</label>
                  <input
                    id="source-id"
                    type="text"
                    placeholder="Enter Source ID"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <label htmlFor="provider-type" className="sr-only">Provider Type</label>
                  <select
                    id="provider-type"
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value)}
                    className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base"
                  >
                    <option value="openalex">OpenAlex</option>
                    <option value="serpapi">SerpAPI</option>
                  </select>
                  <button
                    onClick={handleFetchMember}
                    disabled={!sourceId || isFetchingMember}
                    className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    {isFetchingMember ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Fetching...</span>
                      </>
                    ) : (
                      'Fetch Member'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Grid - Mobil Optimize */}
      <div className="w-full bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {members?.content && members.content.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {members.content.map((member, index: number) => (
                <ScrollAnimation key={member.id} animationType="fade-up" delay={index * 150}>
                  <Link
                    to={`/members/${member.id}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block h-full"
                  >
                    {/* Profile Image */}
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      {member.photoPath ? (
                        <img
                          src={`http://localhost:8080/uploads/${member.photoPath}`}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                          <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-600">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Member Info */}
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {member.name}
                      </h3>
                      
                      {member.description && (
                        <div 
                          className="prose prose-sm text-gray-600 mb-3 sm:mb-4 overflow-hidden member-description text-sm sm:text-base"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}
                          dangerouslySetInnerHTML={{ __html: member.description }}
                        />
                      )}

                      {/* Stats */}
                      <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
                        <div>
                          <p className="text-gray-500 font-medium">Publications</p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">{member.worksCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Citations</p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">{member.citedByCount}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-20 px-4">
              <div className="text-gray-400 mb-4">
                <UserPlusIcon className="h-16 w-16 sm:h-24 sm:w-24 mx-auto" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">No members yet</h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">Start by adding your first team member</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
              >
                Add First Member
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MembersPage;