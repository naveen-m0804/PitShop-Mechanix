import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { ArrowLeft, Car, Bike, Send, Loader } from 'lucide-react';
import { getCurrentLocation } from '../services/geolocation';

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const { shopId } = useParams();
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    vehicleType: 'CAR',
    problemDescription: '',
    aiSuggestion: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const location = await getCurrentLocation();
      
      const requestData = {
        mechanicShopId: shopId,
        clientLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        clientAddress: 'Current Location', // In production, use reverse geocoding
        vehicleType: formData.vehicleType,
        problemDescription: formData.problemDescription,
        aiSuggestion: formData.aiSuggestion,
        images: [],
      };

      const response = await api.post('/client/create-request', requestData);
      
      if (response.data.success) {
        navigate('/my-requests');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Create Repair Request</h1>
        </div>

        {error && (
          <div className="bg-danger bg-opacity-20 border border-danger text-danger px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Type */}
          <div className="glass-card p-6">
            <label className="block text-sm font-medium mb-3">Vehicle Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, vehicleType: 'CAR' })}
                className={`flex-1 p-4 rounded-lg font-semibold transition-all flex flex-col items-center gap-2 ${
                  formData.vehicleType === 'CAR'
                    ? 'bg-primary text-white'
                    : 'bg-bg-card text-text-secondary border border-gray-600'
                }`}
              >
                <Car className="w-8 h-8" />
                Car
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, vehicleType: 'BIKE' })}
                className={`flex-1 p-4 rounded-lg font-semibold transition-all flex flex-col items-center gap-2 ${
                  formData.vehicleType === 'BIKE'
                    ? 'bg-primary text-white'
                    : 'bg-bg-card text-text-secondary border border-gray-600'
                }`}
              >
                <Bike className="w-8 h-8" />
                Bike
              </button>
            </div>
          </div>

          {/* Problem Description */}
          <div className="glass-card p-6">
            <label className="block text-sm font-medium mb-3">
              Problem Description (Optional)
            </label>
            <textarea
              value={formData.problemDescription}
              onChange={(e) =>
                setFormData({ ...formData, problemDescription: e.target.value })
              }
              className="input-field min-h-[120px]"
              placeholder="Describe the issue you're experiencing..."
            />
          </div>

          {/* AI Suggestion */}
          <div className="glass-card p-6">
            <label className="block text-sm font-medium mb-3">
              Your Guess (Optional)
            </label>
            <input
              type="text"
              value={formData.aiSuggestion}
              onChange={(e) =>
                setFormData({ ...formData, aiSuggestion: e.target.value })
              }
              className="input-field"
              placeholder="e.g., Battery issue, Flat tire, etc."
            />
            <p className="text-text-secondary text-sm mt-2">
              If you're not sure, leave it blank. The mechanic will diagnose the issue.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestPage;
