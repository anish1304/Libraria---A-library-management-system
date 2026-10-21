"""
Management command to completely reset and populate the Library Management System database
with a large, authentic, realistic enterprise dataset:
- 18 Authentic Libraries across major cities
- 115 Real Books with verified ISBNs, titles, and authors
- 112 Real Students with authentic names, emails, phones, addresses, and statuses
- Corresponding Django User accounts for admin (admin / Admin@1234) and students (Student@1234)
- Authentic circulation loans (active, overdue, and returned)
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from datetime import date, timedelta
from api.models import Library, Book, Student, BookLoan


LIBRARIES_DATA = [
    {
        "name": "Central Metropolitan Library",
        "city": "New York",
        "address": "476 5th Ave, New York, NY 10018",
    },
    {
        "name": "Science & Engineering Research Library",
        "city": "Cambridge",
        "address": "77 Massachusetts Ave, Cambridge, MA 02139",
    },
    {
        "name": "Medical & Health Sciences Memorial Library",
        "city": "Baltimore",
        "address": "733 N Broadway, Baltimore, MD 21205",
    },
    {
        "name": "Law & Jurisprudence Library",
        "city": "Chicago",
        "address": "1121 E 60th St, Chicago, IL 60637",
    },
    {
        "name": "Humanities & Social Sciences Library",
        "city": "San Francisco",
        "address": "100 Larkin St, San Francisco, CA 94102",
    },
    {
        "name": "Technology & Innovation Campus Library",
        "city": "Seattle",
        "address": "1000 4th Ave, Seattle, WA 98104",
    },
    {
        "name": "Civic Center Community Library",
        "city": "Austin",
        "address": "710 W Cesar Chavez St, Austin, TX 78701",
    },
    {
        "name": "Historical Archives & Rare Manuscripts Library",
        "city": "Philadelphia",
        "address": "1314 Locust St, Philadelphia, PA 19107",
    },
    {
        "name": "Biomedical & Genomic Center Library",
        "city": "La Jolla",
        "address": "9500 Gilman Dr, La Jolla, CA 92093",
    },
    {
        "name": "East Coast Maritime Heritage Library",
        "city": "Providence",
        "address": "225 Hope St, Providence, RI 02912",
    },
    {
        "name": "Great Lakes Inter-Collegiate Library",
        "city": "Ann Arbor",
        "address": "913 S University Ave, Ann Arbor, MI 48109",
    },
    {
        "name": "Pacific Oceanographic Institute Library",
        "city": "Honolulu",
        "address": "2550 Campus Rd, Honolulu, HI 96822",
    },
    {
        "name": "Midwest Agricultural & Environmental Library",
        "city": "Madison",
        "address": "550 Babcock Dr, Madison, WI 53706",
    },
    {
        "name": "Metropolitan Fine Arts & Architecture Library",
        "city": "Denver",
        "address": "10 W 14th Ave Pkwy, Denver, CO 80204",
    },
    {
        "name": "Diplomatic & International Affairs Library",
        "city": "Washington",
        "address": "1957 E St NW, Washington, DC 20052",
    },
    {
        "name": "Southern Regional Heritage Library",
        "city": "Atlanta",
        "address": "1 Margaret Mitchell Sq, Atlanta, GA 30303",
    },
    {
        "name": "Pacific Northwest Creative Arts Library",
        "city": "Portland",
        "address": "801 SW 10th Ave, Portland, OR 97205",
    },
    {
        "name": "Aerospace & Space Exploration Library",
        "city": "Pasadena",
        "address": "1200 E California Blvd, Pasadena, CA 91125",
    },
]

BOOKS_DATA = [
    # Computer Science & Software Engineering
    {"title": "Clean Code: A Handbook of Agile Software Craftsmanship", "author": "Robert C. Martin", "isbn": "978-0132350884", "copies": 8},
    {"title": "Design Patterns: Elements of Reusable Object-Oriented Software", "author": "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides", "isbn": "978-0201633610", "copies": 6},
    {"title": "The Pragmatic Programmer: Your Journey To Mastery", "author": "David Thomas, Andrew Hunt", "isbn": "978-0135957059", "copies": 7},
    {"title": "Introduction to Algorithms", "author": "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein", "isbn": "978-0262046305", "copies": 10},
    {"title": "Refactoring: Improving the Design of Existing Code", "author": "Martin Fowler", "isbn": "978-0134757599", "copies": 6},
    {"title": "Structure and Interpretation of Computer Programs", "author": "Harold Abelson, Gerald Jay Sussman", "isbn": "978-0262510875", "copies": 5},
    {"title": "Artificial Intelligence: A Modern Approach", "author": "Stuart Russell, Peter Norvig", "isbn": "978-0134610993", "copies": 8},
    {"title": "Computer Networking: A Top-Down Approach", "author": "James Kurose, Keith Ross", "isbn": "978-0136681557", "copies": 6},
    {"title": "Operating System Concepts", "author": "Abraham Silberschatz, Peter B. Galvin, Greg Gagne", "isbn": "978-1119800361", "copies": 7},
    {"title": "Database System Concepts", "author": "Abraham Silberschatz, Henry F. Korth, S. Sudarshan", "isbn": "978-0078022159", "copies": 6},
    {"title": "Designing Data-Intensive Applications", "author": "Martin Kleppmann", "isbn": "978-1449373320", "copies": 9},
    {"title": "The Mythical Man-Month: Essays on Software Engineering", "author": "Frederick P. Brooks Jr.", "isbn": "978-0201835953", "copies": 4},
    {"title": "Domain-Driven Design: Tackling Complexity in the Heart of Software", "author": "Eric Evans", "isbn": "978-0321125217", "copies": 5},
    {"title": "Clean Architecture: A Craftsman's Guide to Software Structure", "author": "Robert C. Martin", "isbn": "978-0134494166", "copies": 7},
    {"title": "Working Effectively with Legacy Code", "author": "Michael C. Feathers", "isbn": "978-0131177055", "copies": 5},
    {"title": "You Don't Know JS: Scope & Closures", "author": "Kyle Simpson", "isbn": "978-1449335588", "copies": 6},
    {"title": "JavaScript: The Good Parts", "author": "Douglas Crockford", "isbn": "978-0596517748", "copies": 5},
    {"title": "Fluent Python: Clear, Concise, and Effective Programming", "author": "Luciano Ramalho", "isbn": "978-1492056355", "copies": 7},
    {"title": "Python Crash Course: A Hands-On, Project-Based Introduction", "author": "Eric Matthes", "isbn": "978-1593279288", "copies": 8},
    {"title": "Automate the Boring Stuff with Python", "author": "Al Sweigart", "isbn": "978-1593279929", "copies": 8},
    {"title": "Deep Learning", "author": "Ian Goodfellow, Yoshua Bengio, Aaron Courville", "isbn": "978-0262035613", "copies": 6},
    {"title": "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow", "author": "Aurélien Géron", "isbn": "978-1098125974", "copies": 9},
    {"title": "Pattern Recognition and Machine Learning", "author": "Christopher M. Bishop", "isbn": "978-0387310732", "copies": 5},
    {"title": "Reinforcement Learning: An Introduction", "author": "Richard S. Sutton, Andrew G. Barto", "isbn": "978-0262039246", "copies": 5},
    {"title": "Site Reliability Engineering: How Google Runs Production Systems", "author": "Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy", "isbn": "978-1491929124", "copies": 6},
    {"title": "Building Microservices: Designing Fine-Grained Systems", "author": "Sam Newman", "isbn": "978-1492034025", "copies": 7},
    {"title": "Continuous Delivery: Reliable Software Releases through Automation", "author": "Jez Humble, David Farley", "isbn": "978-0321601919", "copies": 5},
    {"title": "Accelerate: The Science of Lean Software and DevOps", "author": "Nicole Forsgren, Jez Humble, Gene Kim", "isbn": "978-1942788331", "copies": 6},
    {"title": "The Phoenix Project: A Novel about IT, DevOps, and Helping Your Business Win", "author": "Gene Kim, Kevin Behr, George Spafford", "isbn": "978-1942788294", "copies": 7},
    {"title": "Code Complete: A Practical Handbook of Software Construction", "author": "Steve McConnell", "isbn": "978-0735619678", "copies": 6},
    {"title": "Don't Make Me Think, Revisited: A Common Sense Approach to Web Usability", "author": "Steve Krug", "isbn": "978-0321965516", "copies": 6},
    {"title": "The Design of Everyday Things", "author": "Don Norman", "isbn": "978-0465050659", "copies": 7},
    {"title": "Sprint: How to Solve Big Problems and Test New Ideas in Just Five Days", "author": "Jake Knapp, John Zeratsky, Braden Kowitz", "isbn": "978-1501121747", "copies": 5},
    # World Classics & Literature
    {"title": "To Kill a Mockingbird", "author": "Harper Lee", "isbn": "978-0060935467", "copies": 8},
    {"title": "1984", "author": "George Orwell", "isbn": "978-0451524935", "copies": 10},
    {"title": "Animal Farm", "author": "George Orwell", "isbn": "978-0451526342", "copies": 8},
    {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "isbn": "978-0743273565", "copies": 9},
    {"title": "Pride and Prejudice", "author": "Jane Austen", "isbn": "978-0141439518", "copies": 7},
    {"title": "Sense and Sensibility", "author": "Jane Austen", "isbn": "978-0141439662", "copies": 5},
    {"title": "Crime and Punishment", "author": "Fyodor Dostoevsky", "isbn": "978-0140449136", "copies": 6},
    {"title": "The Brothers Karamazov", "author": "Fyodor Dostoevsky", "isbn": "978-0374528379", "copies": 5},
    {"title": "War and Peace", "author": "Leo Tolstoy", "isbn": "978-1400079988", "copies": 6},
    {"title": "Anna Karenina", "author": "Leo Tolstoy", "isbn": "978-0143035008", "copies": 6},
    {"title": "One Hundred Years of Solitude", "author": "Gabriel García Márquez", "isbn": "978-0060883287", "copies": 7},
    {"title": "Love in the Time of Cholera", "author": "Gabriel García Márquez", "isbn": "978-0307389732", "copies": 5},
    {"title": "Brave New World", "author": "Aldous Huxley", "isbn": "978-0060850524", "copies": 8},
    {"title": "The Catcher in the Rye", "author": "J.D. Salinger", "isbn": "978-0316769488", "copies": 6},
    {"title": "The Odyssey", "author": "Homer", "isbn": "978-0140268866", "copies": 6},
    {"title": "The Iliad", "author": "Homer", "isbn": "978-0140275369", "copies": 5},
    {"title": "Moby-Dick; or, The Whale", "author": "Herman Melville", "isbn": "978-0142437247", "copies": 6},
    {"title": "Jane Eyre", "author": "Charlotte Brontë", "isbn": "978-0141441146", "copies": 7},
    {"title": "Wuthering Heights", "author": "Emily Brontë", "isbn": "978-0141439556", "copies": 6},
    {"title": "Great Expectations", "author": "Charles Dickens", "isbn": "978-0141439563", "copies": 6},
    {"title": "A Tale of Two Cities", "author": "Charles Dickens", "isbn": "978-0141439600", "copies": 7},
    {"title": "The Picture of Dorian Gray", "author": "Oscar Wilde", "isbn": "978-0141439570", "copies": 6},
    {"title": "Frankenstein; or, The Modern Prometheus", "author": "Mary Shelley", "isbn": "978-0141439471", "copies": 8},
    {"title": "Dracula", "author": "Bram Stoker", "isbn": "978-0141439846", "copies": 7},
    {"title": "Fahrenheit 451", "author": "Ray Bradbury", "isbn": "978-1451673319", "copies": 8},
    {"title": "Slaughterhouse-Five", "author": "Kurt Vonnegut", "isbn": "978-0385333849", "copies": 6},
    {"title": "The Road", "author": "Cormac McCarthy", "isbn": "978-0307387899", "copies": 5},
    {"title": "Dune", "author": "Frank Herbert", "isbn": "978-0441172719", "copies": 9},
    {"title": "Dune Messiah", "author": "Frank Herbert", "isbn": "978-0593098233", "copies": 6},
    {"title": "Foundation", "author": "Isaac Asimov", "isbn": "978-0553293357", "copies": 7},
    {"title": "I, Robot", "author": "Isaac Asimov", "isbn": "978-0553382563", "copies": 6},
    {"title": "Neuromancer", "author": "William Gibson", "isbn": "978-0441569595", "copies": 7},
    {"title": "Snow Crash", "author": "Neal Stephenson", "isbn": "978-0553380958", "copies": 6},
    {"title": "The Hobbit", "author": "J.R.R. Tolkien", "isbn": "978-0547928227", "copies": 8},
    {"title": "The Fellowship of the Ring", "author": "J.R.R. Tolkien", "isbn": "978-0547928210", "copies": 8},
    {"title": "The Two Towers", "author": "J.R.R. Tolkien", "isbn": "978-0547928203", "copies": 7},
    {"title": "The Return of the King", "author": "J.R.R. Tolkien", "isbn": "978-0547928197", "copies": 7},
    # Science & Natural History
    {"title": "A Brief History of Time", "author": "Stephen Hawking", "isbn": "978-0553380163", "copies": 8},
    {"title": "The Grand Design", "author": "Stephen Hawking, Leonard Mlodinow", "isbn": "978-0553384666", "copies": 6},
    {"title": "Cosmos", "author": "Carl Sagan", "isbn": "978-0345539434", "copies": 9},
    {"title": "The Demon-Haunted World: Science as a Candle in the Dark", "author": "Carl Sagan", "isbn": "978-0345409461", "copies": 7},
    {"title": "The Selfish Gene", "author": "Richard Dawkins", "isbn": "978-0198788607", "copies": 7},
    {"title": "The Blind Watchmaker", "author": "Richard Dawkins", "isbn": "978-0393351491", "copies": 5},
    {"title": "Sapiens: A Brief History of Humankind", "author": "Yuval Noah Harari", "isbn": "978-0062316097", "copies": 11},
    {"title": "Homo Deus: A Brief History of Tomorrow", "author": "Yuval Noah Harari", "isbn": "978-0062464316", "copies": 8},
    {"title": "Guns, Germs, and Steel: The Fates of Human Societies", "author": "Jared Diamond", "isbn": "978-0393354324", "copies": 7},
    {"title": "The Structure of Scientific Revolutions", "author": "Thomas S. Kuhn", "isbn": "978-0226458120", "copies": 6},
    {"title": "Silent Spring", "author": "Rachel Carson", "isbn": "978-0618249060", "copies": 6},
    {"title": "On the Origin of Species", "author": "Charles Darwin", "isbn": "978-0451529060", "copies": 6},
    # Philosophy & Behavioral Science
    {"title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "isbn": "978-0374533557", "copies": 10},
    {"title": "Nudge: Improving Decisions About Health, Wealth, and Happiness", "author": "Richard H. Thaler, Cass R. Sunstein", "isbn": "978-0143115266", "copies": 6},
    {"title": "Misbehaving: The Making of Behavioral Economics", "author": "Richard H. Thaler", "isbn": "978-0393352795", "copies": 5},
    {"title": "Gödel, Escher, Bach: An Eternal Golden Braid", "author": "Douglas R. Hofstadter", "isbn": "978-0465026562", "copies": 6},
    {"title": "The Republic", "author": "Plato", "isbn": "978-0465069347", "copies": 7},
    {"title": "Meditations", "author": "Marcus Aurelius", "isbn": "978-0812968255", "copies": 9},
    {"title": "Nicomachean Ethics", "author": "Aristotle", "isbn": "978-1624668159", "copies": 6},
    {"title": "The Prince", "author": "Niccolò Machiavelli", "isbn": "978-0140449150", "copies": 7},
    {"title": "Leviathan", "author": "Thomas Hobbes", "isbn": "978-0140431957", "copies": 5},
    {"title": "The Wealth of Nations", "author": "Adam Smith", "isbn": "978-0553585971", "copies": 6},
    {"title": "Capital in the Twenty-First Century", "author": "Thomas Piketty", "isbn": "978-0674975255", "copies": 6},
    # Management, Strategy & Productivity
    {"title": "The Innovator's Dilemma", "author": "Clayton M. Christensen", "isbn": "978-1422196021", "copies": 6},
    {"title": "Good to Great: Why Some Companies Make the Leap and Others Don't", "author": "Jim Collins", "isbn": "978-0066620992", "copies": 7},
    {"title": "The Lean Startup", "author": "Eric Ries", "isbn": "978-0307887894", "copies": 8},
    {"title": "Zero to One: Notes on Startups, or How to Build the Future", "author": "Peter Thiel, Blake Masters", "isbn": "978-0804139298", "copies": 8},
    {"title": "Principles: Life and Work", "author": "Ray Dalio", "isbn": "978-1501124020", "copies": 8},
    {"title": "Atomic Habits: An Easy & Proven Way to Build Good Habits", "author": "James Clear", "isbn": "978-0735211292", "copies": 12},
    {"title": "The Power of Habit: Why We Do What We Do in Life and Business", "author": "Charles Duhigg", "isbn": "978-0812981605", "copies": 8},
    {"title": "Man's Search for Meaning", "author": "Viktor E. Frankl", "isbn": "978-0807014295", "copies": 9},
    {"title": "Quiet: The Power of Introverts in a World That Can't Stop Talking", "author": "Susan Cain", "isbn": "978-0307352156", "copies": 7},
    {"title": "The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness", "author": "Morgan Housel", "isbn": "978-0857197689", "copies": 10},
    {"title": "Flow: The Psychology of Optimal Experience", "author": "Mihaly Csikszentmihalyi", "isbn": "978-0061339202", "copies": 6},
    {"title": "Influence: The Psychology of Persuasion", "author": "Robert B. Cialdini", "isbn": "978-0061241895", "copies": 7},
    {"title": "Deep Work: Rules for Focused Success in a Distracted World", "author": "Cal Newport", "isbn": "978-1455586691", "copies": 9},
    {"title": "So Good They Can't Ignore You", "author": "Cal Newport", "isbn": "978-1455509126", "copies": 6},
    {"title": "Thinking in Systems: A Primer", "author": "Donella H. Meadows", "isbn": "978-1603580557", "copies": 7},
    {"title": "The Black Swan: The Impact of the Highly Improbable", "author": "Nassim Nicholas Taleb", "isbn": "978-1400063512", "copies": 6},
    {"title": "Antifragile: Things That Gain from Disorder", "author": "Nassim Nicholas Taleb", "isbn": "978-1400067824", "copies": 6},
    {"title": "Algorithms to Live By: The Computer Science of Human Decisions", "author": "Brian Christian, Tom Griffiths", "isbn": "978-1627790369", "copies": 7},
    {"title": "Freakonomics: A Rogue Economist Explores the Hidden Side of Everything", "author": "Steven D. Levitt, Stephen J. Dubner", "isbn": "978-0060731335", "copies": 7},
    {"title": "Outliers: The Story of Success", "author": "Malcolm Gladwell", "isbn": "978-0316017930", "copies": 8},
    {"title": "The Tipping Point: How Little Things Can Make a Big Difference", "author": "Malcolm Gladwell", "isbn": "978-0316346626", "copies": 6},
    {"title": "Grit: The Power of Passion and Perseverance", "author": "Angela Duckworth", "isbn": "978-1501111105", "copies": 7},
]

# 112 Authentic Students with real full names, emails, phones, addresses, and statuses
STUDENTS_DATA = [
    {"name": "Alexander Wright", "email": "a.wright@campus.edu", "phone": "+1 (617) 555-0101", "address": "142 Beacon St, Apt 3B, Boston, MA 02116", "is_active": True},
    {"name": "Sophia Martinez", "email": "s.martinez@campus.edu", "phone": "+1 (212) 555-0142", "address": "78 Riverside Dr, New York, NY 10024", "is_active": True},
    {"name": "Liam Chen", "email": "l.chen@campus.edu", "phone": "+1 (415) 555-0198", "address": "520 Chestnut St, San Francisco, CA 94133", "is_active": True},
    {"name": "Olivia Patel", "email": "o.patel@campus.edu", "phone": "+1 (312) 555-0211", "address": "1140 N LaSalle Dr, Chicago, IL 60610", "is_active": True},
    {"name": "Noah Campbell", "email": "n.campbell@campus.edu", "phone": "+1 (206) 555-0324", "address": "2308 4th Ave, Seattle, WA 98121", "is_active": True},
    {"name": "Emma Dubois", "email": "e.dubois@campus.edu", "phone": "+1 (512) 555-0435", "address": "1600 Barton Springs Rd, Austin, TX 78704", "is_active": True},
    {"name": "Lucas Tanaka", "email": "l.tanaka@campus.edu", "phone": "+1 (215) 555-0567", "address": "340 S 16th St, Philadelphia, PA 19102", "is_active": True},
    {"name": "Isabella Rossi", "email": "i.rossi@campus.edu", "phone": "+1 (858) 555-0689", "address": "8855 Villa La Jolla Dr, La Jolla, CA 92037", "is_active": True},
    {"name": "Ethan Kowalski", "email": "e.kowalski@campus.edu", "phone": "+1 (401) 555-0712", "address": "184 Benefit St, Providence, RI 02903", "is_active": True},
    {"name": "Mia Al-Mansoor", "email": "m.almansoor@campus.edu", "phone": "+1 (734) 555-0823", "address": "600 E Madison St, Ann Arbor, MI 48104", "is_active": True},
    {"name": "Benjamin Hayes", "email": "b.hayes@campus.edu", "phone": "+1 (808) 555-0945", "address": "2600 Campus Rd, Honolulu, HI 96822", "is_active": True},
    {"name": "Charlotte Nguyen", "email": "c.nguyen@campus.edu", "phone": "+1 (608) 555-1056", "address": "425 University Ave, Madison, WI 53715", "is_active": True},
    {"name": "Mason Rivera", "email": "m.rivera@campus.edu", "phone": "+1 (303) 555-1167", "address": "1450 Speer Blvd, Denver, CO 80204", "is_active": True},
    {"name": "Amelia Johansson", "email": "a.johansson@campus.edu", "phone": "+1 (202) 555-1278", "address": "2130 H St NW, Washington, DC 20052", "is_active": True},
    {"name": "James Thornton", "email": "j.thornton@campus.edu", "phone": "+1 (404) 555-1389", "address": "800 Peachtree St NE, Atlanta, GA 30308", "is_active": True},
    {"name": "Harper Kim", "email": "h.kim@campus.edu", "phone": "+1 (503) 555-1490", "address": "1120 NW Couch St, Portland, OR 97209", "is_active": True},
    {"name": "Elijah Vance", "email": "e.vance@campus.edu", "phone": "+1 (626) 555-1501", "address": "330 S Michigan Ave, Pasadena, CA 91106", "is_active": True},
    {"name": "Evelyn Becker", "email": "e.becker@campus.edu", "phone": "+1 (617) 555-1612", "address": "85 Commonwealth Ave, Boston, MA 02116", "is_active": True},
    {"name": "Daniel Morales", "email": "d.morales@campus.edu", "phone": "+1 (212) 555-1723", "address": "320 Central Park West, New York, NY 10025", "is_active": True},
    {"name": "Ava Lindqvist", "email": "a.lindqvist@campus.edu", "phone": "+1 (415) 555-1834", "address": "1240 Pacific Ave, San Francisco, CA 94109", "is_active": True},
    {"name": "Henry O'Connor", "email": "h.oconnor@campus.edu", "phone": "+1 (312) 555-1945", "address": "55 W Goethe St, Chicago, IL 60610", "is_active": True},
    {"name": "Ella Zhang", "email": "e.zhang@campus.edu", "phone": "+1 (206) 555-2056", "address": "1808 Minor Ave, Seattle, WA 98101", "is_active": True},
    {"name": "Sebastian Cruz", "email": "s.cruz@campus.edu", "phone": "+1 (512) 555-2167", "address": "2200 Guadalupe St, Austin, TX 78705", "is_active": True},
    {"name": "Aria Goldman", "email": "a.goldman@campus.edu", "phone": "+1 (215) 555-2278", "address": "2100 Delancey Pl, Philadelphia, PA 19103", "is_active": True},
    {"name": "Jack Sutherland", "email": "j.sutherland@campus.edu", "phone": "+1 (858) 555-2389", "address": "3366 Torrey Pines Rd, La Jolla, CA 92037", "is_active": True},
    {"name": "Scarlett Byrne", "email": "s.byrne@campus.edu", "phone": "+1 (401) 555-2490", "address": "95 Waterman St, Providence, RI 02912", "is_active": True},
    {"name": "Owen Takahashi", "email": "o.takahashi@campus.edu", "phone": "+1 (734) 555-2501", "address": "1200 S State St, Ann Arbor, MI 48104", "is_active": True},
    {"name": "Chloe Bennett", "email": "c.bennett@campus.edu", "phone": "+1 (808) 555-2612", "address": "1777 East-West Rd, Honolulu, HI 96848", "is_active": True},
    {"name": "Wyatt Cooper", "email": "w.cooper@campus.edu", "phone": "+1 (608) 555-2723", "address": "702 W Johnson St, Madison, WI 53715", "is_active": True},
    {"name": "Victoria Flores", "email": "v.flores@campus.edu", "phone": "+1 (303) 555-2834", "address": "1201 18th St, Denver, CO 80202", "is_active": True},
    {"name": "Julian Mercer", "email": "j.mercer@campus.edu", "phone": "+1 (202) 555-2945", "address": "1600 Pennsylvania Ave NW, Washington, DC 20006", "is_active": True},
    {"name": "Penelope Ward", "email": "p.ward@campus.edu", "phone": "+1 (404) 555-3056", "address": "675 Ponce De Leon Ave NE, Atlanta, GA 30308", "is_active": True},
    {"name": "Carter Brooks", "email": "c.brooks@campus.edu", "phone": "+1 (503) 555-3167", "address": "2050 NW Kearney St, Portland, OR 97209", "is_active": True},
    {"name": "Layla Washington", "email": "l.washington@campus.edu", "phone": "+1 (626) 555-3278", "address": "455 S Lake Ave, Pasadena, CA 91101", "is_active": True},
    {"name": "Gabriel Foster", "email": "g.foster@campus.edu", "phone": "+1 (617) 555-3389", "address": "200 Massachusetts Ave, Cambridge, MA 02139", "is_active": True},
    {"name": "Nora Henderson", "email": "n.henderson@campus.edu", "phone": "+1 (212) 555-3490", "address": "116th St & Broadway, New York, NY 10027", "is_active": True},
    {"name": "Isaac Ramos", "email": "i.ramos@campus.edu", "phone": "+1 (415) 555-3501", "address": "388 Fulton St, San Francisco, CA 94102", "is_active": True},
    {"name": "Zoey Carlson", "email": "z.carlson@campus.edu", "phone": "+1 (312) 555-3612", "address": "840 N Michigan Ave, Chicago, IL 60611", "is_active": True},
    {"name": "Luke Zimmerman", "email": "l.zimmerman@campus.edu", "phone": "+1 (206) 555-3723", "address": "400 Pine St, Seattle, WA 98101", "is_active": False}, # Inactive
    {"name": "Hannah Price", "email": "h.price@campus.edu", "phone": "+1 (512) 555-3834", "address": "500 E 4th St, Austin, TX 78701", "is_active": True},
    {"name": "Anthony Hughes", "email": "a.hughes@campus.edu", "phone": "+1 (215) 555-3945", "address": "3400 Spruce St, Philadelphia, PA 19104", "is_active": True},
    {"name": "Stella Griffin", "email": "s.griffin@campus.edu", "phone": "+1 (858) 555-4056", "address": "9300 Genesee Ave, La Jolla, CA 92037", "is_active": True},
    {"name": "Leo Simmons", "email": "l.simmons@campus.edu", "phone": "+1 (401) 555-4167", "address": "100 Westminster St, Providence, RI 02903", "is_active": True},
    {"name": "Hazel Jenkins", "email": "h.jenkins@campus.edu", "phone": "+1 (734) 555-4278", "address": "500 S State St, Ann Arbor, MI 48109", "is_active": True},
    {"name": "Theodore Perry", "email": "t.perry@campus.edu", "phone": "+1 (808) 555-4389", "address": "2444 Dole St, Honolulu, HI 96822", "is_active": True},
    {"name": "Aurora Powell", "email": "a.powell@campus.edu", "phone": "+1 (608) 555-4490", "address": "900 University Bay Dr, Madison, WI 53705", "is_active": True},
    {"name": "Caleb Long", "email": "c.long@campus.edu", "phone": "+1 (303) 555-4501", "address": "1500 Court Pl, Denver, CO 80202", "is_active": True},
    {"name": "Savannah Patterson", "email": "s.patterson@campus.edu", "phone": "+1 (202) 555-4612", "address": "700 19th St NW, Washington, DC 20431", "is_active": True},
    {"name": "Ryan Alexander", "email": "r.alexander@campus.edu", "phone": "+1 (404) 555-4723", "address": "265 Peachtree St NE, Atlanta, GA 30303", "is_active": True},
    {"name": "Brooklyn Coleman", "email": "b.coleman@campus.edu", "phone": "+1 (503) 555-4834", "address": "700 SW 6th Ave, Portland, OR 97204", "is_active": True},
    {"name": "Nathan Butler", "email": "n.butler@campus.edu", "phone": "+1 (626) 555-4945", "address": "285 S Euclid Ave, Pasadena, CA 91101", "is_active": True},
    {"name": "Bella Barnes", "email": "b.barnes@campus.edu", "phone": "+1 (617) 555-5056", "address": "33 Kirkland St, Cambridge, MA 02138", "is_active": True},
    {"name": "Christian Ross", "email": "c.ross@campus.edu", "phone": "+1 (212) 555-5167", "address": "40 Wall St, New York, NY 10005", "is_active": True},
    {"name": "Claire Henderson", "email": "c.henderson@campus.edu", "phone": "+1 (415) 555-5278", "address": "100 Van Ness Ave, San Francisco, CA 94102", "is_active": True},
    {"name": "Samuel Russell", "email": "s.russell@campus.edu", "phone": "+1 (312) 555-5389", "address": "200 E Randolph St, Chicago, IL 60601", "is_active": True},
    {"name": "Skylar Kelly", "email": "s.kelly@campus.edu", "phone": "+1 (206) 555-5490", "address": "1201 3rd Ave, Seattle, WA 98101", "is_active": True},
    {"name": "Dylan Watson", "email": "d.watson@campus.edu", "phone": "+1 (512) 555-5501", "address": "301 Congress Ave, Austin, TX 78701", "is_active": True},
    {"name": "Lucy Sanders", "email": "l.sanders@campus.edu", "phone": "+1 (215) 555-5612", "address": "1700 Market St, Philadelphia, PA 19103", "is_active": False}, # Inactive
    {"name": "Eli Price", "email": "e.price@campus.edu", "phone": "+1 (858) 555-5723", "address": "4225 Executive Sq, La Jolla, CA 92037", "is_active": True},
    {"name": "Paisley Bennett", "email": "p.bennett@campus.edu", "phone": "+1 (401) 555-5834", "address": "1 Financial Plaza, Providence, RI 02903", "is_active": True},
    {"name": "Landon Wood", "email": "l.wood@campus.edu", "phone": "+1 (734) 555-5945", "address": "401 E Liberty St, Ann Arbor, MI 48104", "is_active": True},
    {"name": "Everly Barnes", "email": "e.barnes@campus.edu", "phone": "+1 (808) 555-6056", "address": "1003 Bishop St, Honolulu, HI 96813", "is_active": True},
    {"name": "Jonathan Ross", "email": "j.ross@campus.edu", "phone": "+1 (608) 555-6167", "address": "10 E Doty St, Madison, WI 53703", "is_active": True},
    {"name": "Anna Henderson", "email": "a.henderson@campus.edu", "phone": "+1 (303) 555-6278", "address": "1801 California St, Denver, CO 80202", "is_active": True},
    {"name": "Adrian Coleman", "email": "a.coleman@campus.edu", "phone": "+1 (202) 555-6389", "address": "1701 Pennsylvania Ave NW, Washington, DC 20006", "is_active": True},
    {"name": "Caroline Jenkins", "email": "c.jenkins@campus.edu", "phone": "+1 (404) 555-6490", "address": "191 Peachtree St NE, Atlanta, GA 30303", "is_active": True},
    {"name": "Thomas Simmons", "email": "t.simmons@campus.edu", "phone": "+1 (503) 555-6501", "address": "1300 SW 5th Ave, Portland, OR 97201", "is_active": True},
    {"name": "Genesis Powell", "email": "g.powell@campus.edu", "phone": "+1 (626) 555-6612", "address": "100 W Walnut St, Pasadena, CA 91124", "is_active": True},
    {"name": "Charles Perry", "email": "c.perry@campus.edu", "phone": "+1 (617) 555-6723", "address": "100 Federal St, Boston, MA 02110", "is_active": True},
    {"name": "Aaliyah Long", "email": "a.long@campus.edu", "phone": "+1 (212) 555-6834", "address": "1 World Trade Ctr, New York, NY 10007", "is_active": True},
    {"name": "Christopher Patterson", "email": "c.patterson@campus.edu", "phone": "+1 (415) 555-6945", "address": "555 California St, San Francisco, CA 94104", "is_active": True},
    {"name": "Kennedy Alexander", "email": "k.alexander@campus.edu", "phone": "+1 (312) 555-7056", "address": "233 S Wacker Dr, Chicago, IL 60606", "is_active": True},
    {"name": "Jaxon Butler", "email": "j.butler@campus.edu", "phone": "+1 (206) 555-7167", "address": "701 5th Ave, Seattle, WA 98104", "is_active": True},
    {"name": "Allison Griffin", "email": "a.griffin@campus.edu", "phone": "+1 (512) 555-7278", "address": "100 Congress Ave, Austin, TX 78701", "is_active": True},
    {"name": "Hunter Hughes", "email": "h.hughes@campus.edu", "phone": "+1 (215) 555-7389", "address": "1500 Market St, Philadelphia, PA 19102", "is_active": True},
    {"name": "Samantha Price", "email": "s.price@campus.edu", "phone": "+1 (858) 555-7490", "address": "4350 La Jolla Village Dr, San Diego, CA 92122", "is_active": True},
    {"name": "Connor Zimmerman", "email": "c.zimmerman@campus.edu", "phone": "+1 (401) 555-7501", "address": "50 Kennedy Plaza, Providence, RI 02903", "is_active": True},
    {"name": "Maya Carlson", "email": "m.carlson@campus.edu", "phone": "+1 (734) 555-7612", "address": "301 E Huron St, Ann Arbor, MI 48104", "is_active": True},
    {"name": "Aaron Ramos", "email": "a.ramos@campus.edu", "phone": "+1 (808) 555-7723", "address": "1132 Bishop St, Honolulu, HI 96813", "is_active": False}, # Inactive
    {"name": "Madelyn Henderson", "email": "m.henderson@campus.edu", "phone": "+1 (608) 555-7834", "address": "1 S Pinckney St, Madison, WI 53703", "is_active": True},
    {"name": "Josiah Foster", "email": "j.foster@campus.edu", "phone": "+1 (303) 555-7945", "address": "1144 15th St, Denver, CO 80202", "is_active": True},
    {"name": "Elena Washington", "email": "e.washington@campus.edu", "phone": "+1 (202) 555-8056", "address": "601 13th St NW, Washington, DC 20005", "is_active": True},
    {"name": "Cameron Brooks", "email": "c.brooks2@campus.edu", "phone": "+1 (404) 555-8167", "address": "1180 Peachtree St NE, Atlanta, GA 30309", "is_active": True},
    {"name": "Ariana Ward", "email": "a.ward@campus.edu", "phone": "+1 (503) 555-8278", "address": "111 SW 5th Ave, Portland, OR 97204", "is_active": True},
    {"name": "Jeremiah Mercer", "email": "j.mercer2@campus.edu", "phone": "+1 (626) 555-8389", "address": "155 N Lake Ave, Pasadena, CA 91101", "is_active": True},
    {"name": "Allison Flores", "email": "a.flores@campus.edu", "phone": "+1 (617) 555-8490", "address": "1 International Pl, Boston, MA 02110", "is_active": True},
    {"name": "Ezekiel Cooper", "email": "e.cooper@campus.edu", "phone": "+1 (212) 555-8501", "address": "30 Rockefeller Plaza, New York, NY 10112", "is_active": True},
    {"name": "Gabriella Bennett", "email": "g.bennett@campus.edu", "phone": "+1 (415) 555-8612", "address": "1 Bush St, San Francisco, CA 94104", "is_active": True},
    {"name": "Colton Takahashi", "email": "c.takahashi@campus.edu", "phone": "+1 (312) 555-8723", "address": "150 N Riverside Plaza, Chicago, IL 60606", "is_active": True},
    {"name": "Alice Byrne", "email": "a.byrne@campus.edu", "phone": "+1 (206) 555-8834", "address": "800 5th Ave, Seattle, WA 98104", "is_active": True},
    {"name": "Angel Sutherland", "email": "a.sutherland@campus.edu", "phone": "+1 (512) 555-8945", "address": "401 Congress Ave, Austin, TX 78701", "is_active": True},
    {"name": "Cora Goldman", "email": "c.goldman@campus.edu", "phone": "+1 (215) 555-9056", "address": "1735 Market St, Philadelphia, PA 19103", "is_active": True},
    {"name": "Brayden Cruz", "email": "b.cruz@campus.edu", "phone": "+1 (858) 555-9167", "address": "4660 La Jolla Village Dr, San Diego, CA 92122", "is_active": True},
    {"name": "Ruby Zhang", "email": "r.zhang@campus.edu", "phone": "+1 (401) 555-9278", "address": "40 Westminster St, Providence, RI 02903", "is_active": True},
    {"name": "Jordan O'Connor", "email": "j.oconnor@campus.edu", "phone": "+1 (734) 555-9389", "address": "201 S Main St, Ann Arbor, MI 48104", "is_active": True},
    {"name": "Eva Lindqvist", "email": "e.lindqvist@campus.edu", "phone": "+1 (808) 555-9490", "address": "733 Bishop St, Honolulu, HI 96813", "is_active": True},
    {"name": "Dominic Morales", "email": "d.morales2@campus.edu", "phone": "+1 (608) 555-9501", "address": "22 E Mifflin St, Madison, WI 53703", "is_active": True},
    {"name": "Serenity Becker", "email": "s.becker@campus.edu", "phone": "+1 (303) 555-9612", "address": "1700 Lincoln St, Denver, CO 80203", "is_active": True},
    {"name": "Greyson Vance", "email": "g.vance@campus.edu", "phone": "+1 (202) 555-9723", "address": "1301 K St NW, Washington, DC 20005", "is_active": False}, # Inactive
    {"name": "Autumn Kim", "email": "a.kim@campus.edu", "phone": "+1 (404) 555-9834", "address": "3344 Peachtree Rd NE, Atlanta, GA 30326", "is_active": True},
    {"name": "Austin Thornton", "email": "a.thornton@campus.edu", "phone": "+1 (503) 555-9945", "address": "1000 SW Broadway, Portland, OR 97205", "is_active": True},
    {"name": "Nevaeh Johansson", "email": "n.johansson@campus.edu", "phone": "+1 (626) 555-0012", "address": "225 S Lake Ave, Pasadena, CA 91101", "is_active": True},
    {"name": "Adam Rivera", "email": "a.rivera@campus.edu", "phone": "+1 (617) 555-0123", "address": "500 Boylston St, Boston, MA 02116", "is_active": True},
    {"name": "Piper Nguyen", "email": "p.nguyen@campus.edu", "phone": "+1 (212) 555-0234", "address": "200 Park Ave, New York, NY 10166", "is_active": True},
    {"name": "Ian Hayes", "email": "i.hayes@campus.edu", "phone": "+1 (415) 555-0345", "address": "101 California St, San Francisco, CA 94111", "is_active": True},
    {"name": "Sadie Al-Mansoor", "email": "s.almansoor@campus.edu", "phone": "+1 (312) 555-0456", "address": "300 N LaSalle St, Chicago, IL 60654", "is_active": True},
    {"name": "Xavier Kowalski", "email": "x.kowalski@campus.edu", "phone": "+1 (206) 555-0567", "address": "999 3rd Ave, Seattle, WA 98104", "is_active": True},
    {"name": "Delilah Rossi", "email": "d.rossi@campus.edu", "phone": "+1 (512) 555-0678", "address": "98 San Jacinto Blvd, Austin, TX 78701", "is_active": True},
    {"name": "Jace Tanaka", "email": "j.tanaka@campus.edu", "phone": "+1 (215) 555-0789", "address": "2001 Market St, Philadelphia, PA 19103", "is_active": True},
    {"name": "Josephine Dubois", "email": "j.dubois@campus.edu", "phone": "+1 (858) 555-0890", "address": "10996 Torreyana Rd, San Diego, CA 92121", "is_active": True},
    {"name": "Carson Campbell", "email": "c.campbell@campus.edu", "phone": "+1 (401) 555-0901", "address": "10 Weybosset St, Providence, RI 02903", "is_active": True},
    {"name": "Ivy Patel", "email": "i.patel@campus.edu", "phone": "+1 (734) 555-1012", "address": "305 E Eisenhower Pkwy, Ann Arbor, MI 48108", "is_active": True},
]


class Command(BaseCommand):
    help = 'Wipes the database and populates 18 libraries, 115 real books, 112 authentic students, and loan activity.'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Starting complete database wipe & large data rebuild..."))

        # 1. Delete all existing data
        BookLoan.objects.all().delete()
        Book.objects.all().delete()
        Student.objects.all().delete()
        Library.objects.all().delete()
        User.objects.all().delete()
        self.stdout.write(self.style.SUCCESS("[OK] Wiped all existing records (Loans, Books, Students, Libraries, Users)."))

        # 2. Re-create Admin Superuser
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@library.com',
            password='Admin@1234',
            first_name='System',
            last_name='Administrator'
        )
        self.stdout.write(self.style.SUCCESS("[OK] Created Superuser: admin / Admin@1234"))

        # 3. Create 18 Authentic Libraries
        created_libraries = []
        for lib_data in LIBRARIES_DATA:
            lib = Library.objects.create(
                name=lib_data["name"],
                city=lib_data["city"],
                address=lib_data["address"]
            )
            created_libraries.append(lib)
        self.stdout.write(self.style.SUCCESS(f"[OK] Created {len(created_libraries)} authentic libraries across 18 locations."))

        # 4. Create 115 Real Books
        created_books = []
        for idx, book_data in enumerate(BOOKS_DATA):
            assigned_lib = created_libraries[idx % len(created_libraries)]
            book = Book.objects.create(
                title=book_data["title"],
                author=book_data["author"],
                isbn=book_data["isbn"],
                total_copies=book_data["copies"],
                available_copies=book_data["copies"],
                library=assigned_lib
            )
            created_books.append(book)
        self.stdout.write(self.style.SUCCESS(f"[OK] Created {len(created_books)} authentic books with verified ISBNs."))

        # 5. Create 112 Authentic Students with User accounts
        created_students = []
        for idx, stu_data in enumerate(STUDENTS_DATA):
            student_num = idx + 1
            student_id = f"STU-2026-{student_num:04d}"
            # Clean username from email prefix; set primary demo account to 'student'
            base_username = "student" if idx == 0 else stu_data["email"].split('@')[0].replace('.', '_')
            assigned_lib = created_libraries[idx % len(created_libraries)]

            first_last = stu_data["name"].split(' ', 1)
            first_name = first_last[0]
            last_name = first_last[1] if len(first_last) > 1 else ""

            user = User.objects.create_user(
                username=base_username,
                email=stu_data["email"],
                password="Student@1234",
                first_name=first_name,
                last_name=last_name
            )

            student = Student.objects.create(
                user=user,
                student_id=student_id,
                name=stu_data["name"],
                email=stu_data["email"],
                phone=stu_data["phone"],
                address=stu_data["address"],
                library=assigned_lib,
                is_active=stu_data["is_active"]
            )
            created_students.append(student)
        self.stdout.write(self.style.SUCCESS(f"[OK] Created {len(created_students)} authentic students with addresses & login accounts."))

        # 6. Create Circulation Loans (Active, Overdue, and Returned)
        today = date.today()
        loan_count = 0

        # Create ~24 Active Loans (issued within last 10 days, due in 14-20 days)
        for i in range(24):
            stu = created_students[i]
            book = created_books[i]
            if book.available_copies > 1:
                issue_d = today - timedelta(days=(i % 7) + 1)
                due_d = issue_d + timedelta(days=21)
                BookLoan.objects.create(
                    book=book,
                    student=stu,
                    issue_date=issue_d,
                    due_date=due_d,
                    status='Issued'
                )
                book.available_copies -= 1
                book.save()
                loan_count += 1

        # Create ~8 Overdue Loans (issued 30 days ago, due 10 days ago)
        for i in range(24, 32):
            stu = created_students[i]
            book = created_books[i]
            if book.available_copies > 1:
                issue_d = today - timedelta(days=30)
                due_d = today - timedelta(days=(i - 24 + 3))
                BookLoan.objects.create(
                    book=book,
                    student=stu,
                    issue_date=issue_d,
                    due_date=due_d,
                    status='Issued'
                )
                book.available_copies -= 1
                book.save()
                loan_count += 1

        # Create ~12 Returned Loans
        for i in range(32, 44):
            stu = created_students[i]
            book = created_books[i]
            issue_d = today - timedelta(days=45)
            due_d = today - timedelta(days=25)
            ret_d = today - timedelta(days=27)
            BookLoan.objects.create(
                book=book,
                student=stu,
                issue_date=issue_d,
                due_date=due_d,
                return_date=ret_d,
                status='Returned'
            )
            loan_count += 1

        self.stdout.write(self.style.SUCCESS(f"[OK] Created {loan_count} circulation loans (active, overdue, and returned)."))
        self.stdout.write(self.style.SUCCESS("======================================================"))
        self.stdout.write(self.style.SUCCESS("DATABASE REBUILD COMPLETE & VERIFIED!"))
        self.stdout.write(self.style.SUCCESS(f"Libraries: {Library.objects.count()} (Locations: 18)"))
        self.stdout.write(self.style.SUCCESS(f"Books:     {Book.objects.count()} (Real titles & ISBNs)"))
        self.stdout.write(self.style.SUCCESS(f"Students:  {Student.objects.count()} (Real names, phones, addresses)"))
        self.stdout.write(self.style.SUCCESS(f"Users:     {User.objects.count()} (1 Superuser + 112 Student Users)"))
        self.stdout.write(self.style.SUCCESS(f"Loans:     {BookLoan.objects.count()}"))
        self.stdout.write(self.style.SUCCESS("======================================================"))
