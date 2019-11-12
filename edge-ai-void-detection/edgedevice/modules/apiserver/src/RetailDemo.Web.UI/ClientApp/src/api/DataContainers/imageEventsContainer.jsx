import { useQuery } from 'react-fetching-library';
import { fetchImageEvents } from "../FetchComponents/fetchImageEvents";

export const imageEventsContainer = (edgeDevice) => {
    //const { edgeDevice} = props;

    const { loading, payload, error, query } = useQuery(fetchImageEvents(edgeDevice), false);

    let isLoading = loading;
    const isError = error;
    const reload = query;

    if (payload === undefined) isLoading = true;

    let capturetime = "";
    let imgSrc = "";
    let newOutOfStockItems = 0;

    if (payload !== undefined) {
        imgSrc = payload.body.dest_img;
        newOutOfStockItems = payload.body.result.num_detections;
        capturetime = payload.capturetime;
    }

    return { isLoading, imgSrc, capturetime, newOutOfStockItems, isError, reload };
}