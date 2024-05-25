import "./about.css"

export default function About() {
    return  <div className={"about"}>
    <section id="introduction" className={"section-about"}>
        <h2 className={"h2-about"}>What Makes Us Unique?</h2>
        <p className={"p-about"}>
            At Our Tournament Universe, we're more than just a platform for competitive gaming. We're a community of gamers and organizers who share a passion for esports and friendly competition.
        </p>
        <p>
            Join us on a journey through the cosmos of gaming, where you'll discover the stars of the gaming world, engage in epic battles, and forge friendships that are out of this world.
        </p>
    </section>

    <section id="login-signup" className={"section-about"}>
        <h2 className={"h2-about"}>Launching Your Journey</h2>
        <p>
            To embark on your gaming adventure, follow these steps:
        </p>
        <ol>
            <li><strong>Login or Signup:</strong> On the right end of the main website navbar, you'll find the "Login" and "Signup" options. Create your account with a unique "username" and "password."</li>
            <li><strong>Player Dashboard:</strong> Your portal to the cosmos of tournaments. Manage your tournament registrations and access all the relevant information from one place.</li>
            <li><strong>Explore the Universe:</strong> Our main page is your launchpad to all the tournaments in our galaxy. Discover upcoming, completed, and ongoing events.</li>
        </ol>
    </section>

    <section id="organization-page" className={"section-about"}>
        <h2  className={"h2-about"}>Create or Join an Organization</h2>
        <p>
            Our journey doesn't end with individual players. You can also form or join organizations, each a unique constellation in our gaming galaxy.
        </p>
        <p>
            Create an organization and become its organizer, or join an existing one to collaborate and compete with like-minded individuals.
        </p>
    </section>

    <section id="tournament-admin-pages" className={"section-about"}>
        <h2   className={"h2-about"}>Tournament Administration</h2>
        <p>
            For those who want to shape their own gaming worlds, our tournament admin features offer you the power to create and manage tournaments:
        </p>
        <ul className={"ul-about"}>
            <li className={"li-about"}><strong>Dashboard:</strong> Launch your tournament and navigate through its phases, from inception to completion.</li>
            <li className={"li-about"}><strong>Edit Tournament:</strong> Customize your event, control its visibility, and adjust start times. Craft the perfect gaming experience.</li>
            <li className={"li-about"}><strong>Edit Participants:</strong> Sculpt your participant list, ensuring your event is populated with cosmic competitors.</li>
        </ul>
    </section>

    <section id="matches" className={"section-about"}>
        <h2  className={"h2-about"} >Engage in Epic Battles</h2>
        <p>
            In the depths of our universe, battles unfold on the match pages. Whether you're a participant or an admin, this is where the real action happens:
        </p>
        <ul className={"ul-about"}>
            <li className={"li-about"}><strong>Participants:</strong> Report your match results and aim for the stars, keeping the tournament cosmos in balance.</li>
            <li className={"li-about"}><strong>Admins:</strong> Shine like a supernova as you oversee match results, declaring winners and ensuring fairness.</li>
        </ul>
    </section>

    <section id="conclusion" className={"section-about"}>
        <h2 className={"h2-about"}>Join Our Cosmic Community</h2>
        <p>
            Our Tournament Universe is more than a platform; it's a vibrant cosmos where gamers and organizers converge. Join us today, and let's explore the gaming galaxy together.
        </p>
    </section>


    </div>
}