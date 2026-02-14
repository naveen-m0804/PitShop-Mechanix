import React, { useState, useEffect } from 'react';
import { mechanicApi, userApi } from '../lib/api';
import { RepairRequest } from '../lib/api';
import { Check, X, Wrench, Clock, MapPin, Phone, AlertCircle, User, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import AIAssistant from '@/components/AIAssistant';
import socketService from '../services/socket';
import PageLoader from '@/components/ui/PageLoader';

const MechanicDashboard: React.FC = () => {
  const [incomingRequests, setIncomingRequests] = useState<RepairRequest[]>([]);
  const [activeJobs, setActiveJobs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // setLoading(true); // Removed to prevent flickering
      const [incoming, active] = await Promise.all([
        mechanicApi.getIncomingRequests(),
        mechanicApi.getActiveJobs(),
      ]);
      setIncomingRequests(
        incoming.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      );
      setActiveJobs(
        active.sort((a, b) => new Date(b.acceptedAt || b.createdAt || 0).getTime() - new Date(a.acceptedAt || a.createdAt || 0).getTime())
      );
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeDashboard = async () => {
      await fetchData();
      
      try {
        const userProfile = await userApi.getProfile();
        const userId = userProfile.id;

        if (userId) {
            // Subscribe to real-time notifications
            socketService.connect(() => {
                socketService.subscribeToUserNotifications(userId, (notification) => {
                if (notification.type === 'NEW_REQUEST') {
                        console.log("New Request notification:", notification);
                        toast({
                            title: 'New Request Received',
                            description: `New ${notification.data.vehicleType} request`,
                        });
                        // Add to incoming requests immediately
                        setIncomingRequests(prev => [notification.data, ...prev]);
                    } else if (notification.type === 'SOS_ALERT') {
                         console.log("SOS Alert notification:", notification);
                         toast({
                            title: 'SOS Alert!',
                            description: 'Emergency request received!',
                            variant: 'destructive'
                        });
                        setIncomingRequests(prev => [notification.data, ...prev]);
                    } else if (notification.type === 'REQUEST_TAKEN') {
                        console.log("REQUEST_TAKEN notification received:", notification);
                        toast({
                            title: 'Request Taken',
                            description: 'Another mechanic has accepted this request.',
                        });
                        // Remove from incoming requests
                        setIncomingRequests(prev => {
                            const filtered = prev.filter(req => {
                                // Log comparison for debugging
                                const match = req.id !== notification.data.id;
                                if (!match) console.log("Removing request:", req.id);
                                return match;
                            });
                            return filtered;
                        });
                    } else {
                        // For other updates (status changes), refresh data
                        fetchData();
                    }
                });
            });
        }
      } catch (error) {
        console.error("Failed to setup WebSocket:", error);
      }
    };

    initializeDashboard();

    // Keep polling as backup (every 30s instead of 2s)
    const interval = setInterval(fetchData, 30000);

    return () => {
      clearInterval(interval);
      socketService.disconnect();
    };
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await mechanicApi.acceptRequest(requestId);
      toast({
        title: 'Success',
        description: 'Request accepted successfully',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to accept request',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await mechanicApi.rejectRequest(requestId);
      toast({
        title: 'Info',
        description: 'Request rejected',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async (requestId: string) => {
    try {
      await mechanicApi.updateStatus(requestId, 'COMPLETED');
      toast({
        title: 'Success',
        description: 'Job marked as completed',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to complete job',
        variant: 'destructive',
      });
    }
  };

  const RequestCard: React.FC<{ request: RepairRequest; showActions?: boolean; isJob?: boolean }> = ({ request, showActions = true, isJob = false }) => (
    <div className="glass-card p-6 transition-all hover:border-primary/50 relative overflow-hidden group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${
                isJob ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-400'
            } group-hover:bg-opacity-20 transition-colors`}>
              <Wrench size={20} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{request.vehicleType.replace('_', ' ')}</h3>
          </div>
          <p className="text-muted-foreground text-sm">{request.problemDescription}</p>
        </div>
        {request.type === 'SOS' && (
          <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold rounded-full flex items-center gap-1 animate-pulse">
            <AlertCircle size={14} />
            SOS
          </span>
        )}
      </div>

       {/* Client Details for Active Jobs (Hide for Completed) */}
       {isJob && request.status !== 'COMPLETED' && (request.clientName || request.clientPhone) && (
        <div className="bg-secondary/30 rounded-lg p-3 mb-4">
           <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Client Details</h4>
           <div className="space-y-1">
             {request.clientName && (
               <div className="flex items-center gap-2 text-sm text-foreground">
                 <div className="w-4 flex justify-center"><User size={14} className="text-primary" /></div>
                 <span>{request.clientName}</span>
               </div>
             )}
             {request.clientPhone && (
               <div className="flex items-center gap-2 text-sm text-foreground">
                 <div className="w-4 flex justify-center"><Phone size={14} className="text-primary" /></div>
                 <a href={`tel:${request.clientPhone}`} className="hover:underline">{request.clientPhone}</a>
               </div>
             )}
           </div>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-foreground">
             <FileText size={16} className="text-primary/60" />
             <span>{request.problemDescription || "Description not mentioned"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={16} className="text-primary/60" />
          <span>{new Date(request.createdAt!).toLocaleString()}</span>
        </div>
      </div>

      {request.repairGuess && (
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-4">
          <p className="text-sm text-primary">
            <strong>AI Suggestion:</strong> {request.repairGuess}
          </p>
        </div>
      )}

      {showActions && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleAccept(request.id!)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 active:scale-95"
          >
            <Check size={18} />
            Accept
          </button>
          <button
            onClick={() => handleReject(request.id!)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20 active:scale-95"
          >
            <X size={18} />
            Reject
          </button>
        </div>
      )}

      {isJob && (
        <div className="flex gap-3 pt-2">
            <button
                onClick={() => handleComplete(request.id!)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
                <Check size={18} />
                Complete Job
            </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Mechanic Dashboard</h1>

        {/* Incoming Requests */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="text-yellow-400" />
            Incoming Requests ({incomingRequests.length})
          </h2>
          {incomingRequests.length === 0 ? (
            <div className="glass-card rounded-lg p-8 text-center text-muted-foreground">
              No incoming requests at the moment
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {incomingRequests.map((request) => (
                <RequestCard key={request.id} request={request} showActions={true} />
              ))}
            </div>
          )}
        </div>

        {/* Active Jobs */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Wrench className="text-green-400" />
            Active Jobs ({activeJobs.length})
          </h2>
          {activeJobs.length === 0 ? (
            <div className="glass-card rounded-lg p-8 text-center text-muted-foreground">
              No active jobs
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeJobs.map((request) => (
                <RequestCard key={request.id} request={request} showActions={false} isJob={true} />
              ))}
            </div>
          )}
        </div>
      </div>
      <AIAssistant />
    </div>
  );
};

export default MechanicDashboard;
