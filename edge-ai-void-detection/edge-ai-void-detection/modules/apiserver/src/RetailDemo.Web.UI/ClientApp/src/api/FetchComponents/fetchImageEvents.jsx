import Action from 'react-fetching-library';

export const fetchImageEvents = (edgeDevice) => {
    return {
        method: 'GET',
        endpoint: '/api/ImageEvents/edgeDevice/' + edgeDevice,
    }
};