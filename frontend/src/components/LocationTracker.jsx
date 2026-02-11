import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocation, setLocationError } from '../store/locationSlice';
import { fetchNearbyShops } from '../store/shopsSlice';

const LocationTracker = () => {
    const dispatch = useDispatch();
    const { currentLocation } = useSelector((state) => state.location);
    const { user } = useSelector((state) => state.auth);
    const locationRef = React.useRef(currentLocation);

    // Keep ref in sync without triggering effects
    useEffect(() => {
        locationRef.current = currentLocation;
    }, [currentLocation]);

    useEffect(() => {
        if (!user || user.role !== 'CLIENT') return;

        if (!navigator.geolocation) {
            dispatch(setLocationError('Geolocation is not supported by your browser'));
            return;
        }

        const handleSuccess = (position) => {
            const { latitude, longitude } = position.coords;
            const newLoc = { latitude, longitude };
            const lastLoc = locationRef.current;

            const shouldUpdate = !lastLoc ||
                (Math.abs(lastLoc.latitude - latitude) > 0.0001 ||
                    Math.abs(lastLoc.longitude - longitude) > 0.0001);

            if (shouldUpdate) {
                dispatch(setLocation(newLoc));
                // Fetch shops with a large radius to ensure ALL shops are visible
                dispatch(fetchNearbyShops({ lat: latitude, lng: longitude, radius: 5000000 }));
            }
        };

        const handleError = (error) => {
            console.error('Location tracking error:', error);
            dispatch(setLocationError(error.message));
        };

        const watchId = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
                distanceFilter: 100
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [dispatch, user]); // Removed currentLocation from dependencies

    return null;
};

export default LocationTracker;
