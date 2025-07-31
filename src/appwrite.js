import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const TMDB_POSTER_BASE_URL = `https://media.themoviedb.org/t/p/w300_and_h450_bestv2`
const ENDPOINT_URL = 'https://fra.cloud.appwrite.io/v1';

const client = new Client()
    .setEndpoint(ENDPOINT_URL)
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm,movie) => {
    
    //1. use appwrite sdk to check if the search term exists in the database
    try {
        const result = await database.listDocuments(DATABASE_ID,COLLECTION_ID,[
            Query.equal('searchTerm', searchTerm)
        ]);
        
        //2. if it exists, increment the search count
        if (result.documents.length > 0) {
            const doc = result.documents[0];

            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                doc.$id,
                {
                    count: doc.count + 1
                }
            );
                
        //3. if it doesn't exist, create a new document with the search term and set the count to 1
        } else {
            await database.createDocument(DATABASE_ID,COLLECTION_ID,ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `${TMDB_POSTER_BASE_URL}/${movie.poster_path}`,
            })
        }
    } catch (error) {
        console.error('Error updating search count:', error);

    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count')
        ]);

        return result.documents;
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        
    }
}