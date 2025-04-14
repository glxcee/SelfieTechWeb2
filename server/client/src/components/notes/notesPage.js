import Markdown from 'react-markdown';
import { useState } from 'react';


export default function NotesPage(){
    const [content, setContent] = useState('');


    return(
        <div className="flex justify-center items-center h-screen bg-amber-100">
            <div className="w-1/3 bg-yellow-700 h-full rounded-xl">
                lista note |
            </div>
            <div className="w-full bg-amber-100 h-full flex flex-col justify-center items-center gap-3">
                <div>
                    Save
                </div>
                <textarea className="w-full h-full p-4 bg-amber-100 outline-none"
                    placeholder="Write your note here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)} />
            </div>
        </div>
    )
}