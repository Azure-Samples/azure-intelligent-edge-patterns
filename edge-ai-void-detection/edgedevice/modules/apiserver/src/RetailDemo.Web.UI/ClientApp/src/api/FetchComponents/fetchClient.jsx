import { createClient } from 'react-fetching-library';
import { requestHostInterceptor } from '../../api/FetchComponents/requestHostInterceptor';

// Import app settings
import { apiUrl } from '../../app/App.settings.jsx';

const endpointUrl = localStorage.getItem("endpointUrl");

export const client = createClient({
    requestInterceptors: [requestHostInterceptor(endpointUrl)],
});