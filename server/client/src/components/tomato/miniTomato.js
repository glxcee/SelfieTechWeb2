import { useNavigate } from 'react-router-dom';
import './miniTomato.css'

export default function MiniTomatoPage() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/selfie/tomato');
    };

    return (
        <div className="flex flex-wrap overflow-hidden w-full" onClick={handleClick}>
            <div className="tomato">
                <div className="time">
                    00:00
                </div>
            </div>
        </div>
    );
}
