import { useState, useRef, useEffect } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { envoyerMessageChatbotIA } from '../services/apiServiceChatbotIA';
import '../styles/chatbot.css';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Bonjour ! Je suis Fursa, votre coach carrière IA. Vous cherchez une opportunité en Tunisie ?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const messageEnvoye = input;
    setMessages((prev) => [...prev, { text: messageEnvoye, isBot: false }]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await envoyerMessageChatbotIA(messageEnvoye);
      setMessages((prev) => [...prev, { text: data.reponse, isBot: true }]);
    } catch (err) {
      console.error('Erreur chatbot IA :', err);
      setMessages((prev) => [
        ...prev,
        { text: "Désolé, je rencontre un souci technique. Réessayez dans un instant.", isBot: true },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot">
      {isOpen && (
        <div className="chatbot__panel fade-in-up">
          <div className="chatbot__header">
            <div className="chatbot__header-info">
              <div className="chatbot__avatar"><RiRobot2Line size={18} /></div>
              <div>
                <h3>Coach Fursa</h3>
                <p>En ligne</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}><FiX size={18} /></button>
          </div>

          <div className="chatbot__body">
            {messages.map((m, idx) => (
              <div key={idx} className={`chatbot__row ${m.isBot ? '' : 'chatbot__row--user'}`}>
                {m.isBot && <div className="chatbot__bubble-avatar"><RiRobot2Line size={12} /></div>}
                <div className={`chatbot__bubble ${m.isBot ? 'chatbot__bubble--bot' : 'chatbot__bubble--user'}`}>
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chatbot__row">
                <div className="chatbot__bubble-avatar"><RiRobot2Line size={12} /></div>
                <div className="chatbot__bubble chatbot__bubble--bot chatbot__typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot__input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Posez votre question..."
            />
            <button onClick={handleSend}><FiSend size={14} /></button>
          </div>
        </div>
      )}

      <button className="chatbot__toggle" onClick={() => setIsOpen(!isOpen)}>
        {!isOpen && <span className="chatbot__ping" />}
        {isOpen ? <FiX size={24} /> : <RiRobot2Line size={26} />}
      </button>
    </div>
  );
}