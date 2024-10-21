import { useNavigate } from 'react-router-dom';

export default function MiniTomatoPage() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/selfie/tomato');
    };

    return (
        <div className="flex justify-center items-center" onClick={handleClick}>
            <div className="relative w-64 h-64 rounded-[45%] overflow-hidden bg-red-300 cursor-pointer">
                <div className="absolute w-72 h-0 bg-red-300 bottom-0 transition-height duration-1000 ease-linear"></div>
                <div className="absolute text-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-semibold text-gray-700 z-10">
                    00:00
                </div>
            </div>
        </div>
    );
}
