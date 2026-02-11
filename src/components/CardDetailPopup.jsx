import React from 'react';
import tapIcon from '../assets/icons/tap.webp';
import mightIcon from '../assets/icons/might.webp';
import './CardDetailPopup.css';

function CardDetailPopup({ card, onClose, onAdd }) {
    if (!card) return null;

    const renderTextWithIcons = (text) => {
        if (!text) return null;

        // Split by tokens and map
        const parts = text.split(/(:rb_exhaust:|:rb_might:)/g);
        
        return parts.map((part, index) => {
            if (part === ':rb_exhaust:') {
                return <img key={index} src={tapIcon} alt="Exhaust" style={{ width: '16px', height: '16px', verticalAlign: 'middle' }} />;
            }
            if (part === ':rb_might:') {
                return <img key={index} src={mightIcon} alt="Might" style={{ width: '16px', height: '16px', verticalAlign: 'middle' }} />;
            }
            return part;
        });
    };

    return (
        <div className="card-detail-overlay" onClick={onClose}>
            <div className="card-detail-popup" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                
                <div className="popup-content">
                    <div className="popup-image">
                        {card.image_url && <img src={card.image_url} alt={card.name} />}
                    </div>
                    
                    <div className="popup-info">
                        <h2>{card.name}</h2>
                        
                        <div className="popup-stats">
                             <span className="stat-badge type">{card.type}</span>
                             {card.energy !== undefined && <span className="stat-badge energy">Energy: {card.energy}</span>}
                        </div>

                        {card.plain_text && (
                            <div className="popup-text">
                                <p>{renderTextWithIcons(card.plain_text)}</p>
                            </div>
                        )}

                        {card.type === "Creature" && (card.power !== undefined || card.might !== undefined) && (
                            <div className="popup-combat-stats">
                                {card.power !== undefined && <span>PWR: {card.power}</span>}
                                {card.might !== undefined && <span>MGT: {card.might}</span>}
                            </div>
                        )}
                        
                        <div className="popup-actions">
                            <button className="add-button" onClick={() => {
                                onAdd(card);
                                onClose();
                            }}>Add to Deck</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardDetailPopup;
