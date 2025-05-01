import Markdown from 'react-markdown';
import { useState, useEffect } from 'react';
import { address } from '../../utils.js';
import { v4 as uuidv4 } from 'uuid';

export default function NotesPage(){
    const [content, setContent] = useState('');
    const [noteId, setNoteId] = useState('');
    const [title, setTitle] = useState('');
    const [render, setRender] = useState(true);
    const [renderedContent, setRenderedContent] = useState('');
    const [focus, setFocus] = useState(true);

    const [mobile, setMobile] = useState(false);

    const [book, setBook] = useState([]);
    
    function newNote(arr) {
        arr.push({
            id: uuidv4(),
            title: "New note",
            categories: [],
            content: "*Still nothing..*",
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        })
        return arr
    }

        useEffect(() => {
            fetch(address+"api/notes")
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    if(data.notes.length == 0){
                        data.notes = newNote(data.notes)
                    }
                    setBook(data.notes);
                    setNoteId(data.notes[0].id)
                })
        },[])

        useEffect(() => {
            setRenderedContent(content.replace(/(?<!  )\n/g, '  \n'));

            let temp = [...book]
            temp.find((note, index) => {
                if(note.id === noteId){
                    temp[index].content = content
                    temp[index].title = title
                    temp[index].modified = new Date().toISOString()
                    return true
                }
            })
            //temp.sort()

            setBook(temp)
        },[content, title])

        useEffect(() => {
            console.log(noteId)
            if(noteId !== ""){
                book.find((note, index) => {
                    if(note.id === noteId){
                        setContent(note.content)
                        setTitle(note.title)
                        return true
                    }
                })
            }
        }, [noteId])

    function handleSave() {
        console.log(book)
        fetch(address+'api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notes: book })
        }).then(res => console.log(res))
    }

    function handleNewNote() {
        let temp = [...book]
        temp = newNote(temp)
        setBook(temp)
        setNoteId(temp[temp.length - 1].id)
    }

    return(
        <div className={"flex justify-center items-center h-screen transition-all duration-300 " + (focus ? "bg-amber-100" : "bg-amber-200")}>
            <div className={(mobile ? "" : "hidden") + " w-full sm:w-1/3 bg-yellow-700 h-full rounded-xl text-white sm:flex flex-col items-center p-3"} onClick={() => setRender(true)}>
                <div className='w-full flex items-center justify-between p-3'>
                    <span className='text-2xl font-bold text-center'>All Notes</span>
                    <svg onClick={() => handleNewNote()} className='w-16 h-16 cursor-pointer'
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                        <g id="SVGRepo_iconCarrier">
                            {" "}
                            <path
                            className='stroke-white'
                            d="M10 12H14M12 10V14M19.9592 15H16.6C16.0399 15 15.7599 15 15.546 15.109C15.3578 15.2049 15.2049 15.3578 15.109 15.546C15 15.7599 15 16.0399 15 16.6V19.9592M20 14.1031V7.2C20 6.07989 20 5.51984 19.782 5.09202C19.5903 4.71569 19.2843 4.40973 18.908 4.21799C18.4802 4 17.9201 4 16.8 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.0799 4 7.2V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.0799 20 7.2 20H14.1031C14.5923 20 14.8369 20 15.067 19.9447C15.2711 19.8957 15.4662 19.8149 15.6451 19.7053C15.847 19.5816 16.0199 19.4086 16.3658 19.0627L19.0627 16.3658C19.4086 16.0199 19.5816 15.847 19.7053 15.6451C19.8149 15.4662 19.8957 15.2711 19.9447 15.067C20 14.8369 20 14.5923 20 14.1031Z"
                            
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            />{" "}
                        </g>
                    </svg>

                </div>
                <div className='w-full h-full flex flex-col justify-start items-center p-3 gap-2 overflow-y-auto divide-white divide-y-2'>
                    {
                    book.map((note, index) => (
                        <div key={index} onClick={() => setNoteId(note.id)} className={'cursor-pointer '+ (noteId === note.id ? "bg-yellow-900" : "")}>
                            <span>{note.title}</span>
                        </div>
                    ))
                    }
                </div>
            </div>
            <div className={(mobile ? "hidden" : "") + " w-full h-full flex flex-col justify-center items-center p-3 gap-2"}>
                <div className='w-full flex items-center justify-between p-3' onClick={() => setRender(true)}>
                    <button onClick={() => setMobile(true)} className="sm:hidden bg-yellow-700 p-2 rounded-lg border-yellow-700 border-2 transition duration-300 hover:bg-yellow-600 hover:border-yellow-600">
                        <svg viewBox="0 0 24 24" className='w-8 h-8 stroke-white' fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                            <g id="SVGRepo_iconCarrier">
                                {" "}
                                <path
                                d="M20 8.25V18C20 21 18.21 22 16 22H8C5.79 22 4 21 4 18V8.25C4 5 5.79 4.25 8 4.25C8 4.87 8.24997 5.43 8.65997 5.84C9.06997 6.25 9.63 6.5 10.25 6.5H13.75C14.99 6.5 16 5.49 16 4.25C18.21 4.25 20 5 20 8.25Z"
                                
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                />{" "}
                                <path
                                d="M16 4.25C16 5.49 14.99 6.5 13.75 6.5H10.25C9.63 6.5 9.06997 6.25 8.65997 5.84C8.24997 5.43 8 4.87 8 4.25C8 3.01 9.01 2 10.25 2H13.75C14.37 2 14.93 2.25 15.34 2.66C15.75 3.07 16 3.63 16 4.25Z"
                                
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                />{" "}
                                <path
                                d="M8 13H12"
                                
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                />{" "}
                                <path
                                d="M8 17H16"
                                
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                />{" "}
                            </g>
                        </svg>

                    </button>
                    <button onClick={() => handleSave()} className="bg-amber-100 text-yellow-700 p-2 rounded-lg border-yellow-700 border-2 transition duration-300 hover:bg-yellow-700 hover:text-white">
                        Save
                    </button>
                </div>
                <div className='w-full bg-amber-100 rounded-lg p-4'> 
                    <input className='bg-amber-100 outline-none text-2xl' type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder='Title' />
                </div>
                <div onMouseEnter={() => setFocus(true)} onMouseLeave={() => setFocus(false)} className='w-full h-full '>
                {
                    !render ?
                    <div className='w-full h-full bg-amber-100 p-4 rounded-lg'>
                    <textarea className="w-full h-full bg-amber-100  outline-none rounded-lg"
                        placeholder="Write your note here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)} /> 
                    </div>
                        :
                    <div id="markdown-p" onClick={() => setRender(false)} 
                        className={'w-full h-full bg-amber-100 p-4 hover:bg-amber-200 rounded-lg transition duration-300 ' + (content ? "" : "text-gray-500")}>
                        <Markdown>
                            {content ? renderedContent : "*Still nothing..*"}
                        </Markdown>
                    </div>
                }
                </div>
            </div>
        </div>
    )
}