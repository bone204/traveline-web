import { HeroCarousel } from "@/components/hero.carousel";

const featuredStories = [
  {
    title: "Khởi hành cuối tuần",
    summary: "Combo bay + khách sạn Đà Nẵng 3N2Đ từ 3.6tr",
  },
  {
    title: "Ẩm thực Tokyo",
    summary: "Tour foodie 4 ngày ăn thả ga Michelin street food",
  },
  {
    title: "Lạc giữa Cappadocia",
    summary: "Đặt ngay vé khinh khí cầu bình minh, slot giới hạn",
  },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <HeroCarousel />

      <section className="home-page__cards">
        {featuredStories.map((story) => (
          <article key={story.title}>
            <h3>{story.title}</h3>
            <p>{story.summary}</p>
            <button type="button">Xem chi tiết</button>
          </article>
        ))}
      </section>
    </div>
  );
}
