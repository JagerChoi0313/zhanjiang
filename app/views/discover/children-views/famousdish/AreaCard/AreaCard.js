import {Carousel} from 'antd'
import Image from 'next/image'

// --- 样式定义 (保持你喜欢的集成式写法) ---
const CardContainer = {
    width: '280px', height: '110px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    padding: '12px', display: 'flex', alignItems: 'center',
    overflow: 'hidden', backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255,255,255,0.3)', position: 'relative'
};

const LeftContentStyle = {
    flex: 1, paddingRight: '8px', display: 'flex',
    flexDirection: 'column', height: '100%', minWidth: 0
};

const TitleAreaStyle = {
    fontSize: '16px', fontWeight: 'bold', color: '#334155',
    marginBottom: '4px', display: 'flex', alignItems: 'baseline', gap: '6px'
};

const ImageWrapper = {
    width: '85px', height: '85px', borderRadius: '12px',
    overflow: 'hidden', flexShrink: 0, position: 'relative', background: '#f8fafc'
};

// --- 通用卡片组件 ---
const AreaCard = ({ areaName, areaSlug, carouselData }) => {
    // 这里的 carouselData 是从后端接口获取的数组
    return (
        <div style={CardContainer}>
            <div style={LeftContentStyle}>
                <div style={TitleAreaStyle}>
                    <span>{areaName}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal' }}>
                        {areaSlug?.toUpperCase()}
                    </span>
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Carousel autoplay dots={false} effect="fade" speed={800} autoplaySpeed={3000}>
                        {carouselData?.map((item, index) => (
                            <div key={index}>
                                <div style={{ fontSize: '11px', color: '#1e293b', fontWeight: '600', WebkitLineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.title}
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.description}
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </div>
            </div>

            <div style={ImageWrapper}>
                <Carousel autoplay dots={false} effect="fade" speed={800} autoplaySpeed={3000}>
                    {carouselData?.map((item, index) => (
                        <div key={index}>
                            <div style={{ width: '85px', height: '85px', position: 'relative' }}>
                                <Image
                                    src={item.imgUrl}
                                    alt={item.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    priority={index === 0}
                                />
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>
        </div>
    );
};

export default AreaCard;