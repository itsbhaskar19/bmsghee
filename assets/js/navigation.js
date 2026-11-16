document.querySelectorAll(".menu-toggle").forEach((toggle) => {
    const navigation = document.getElementById(toggle.getAttribute("aria-controls"));

    if (!navigation) return;

    function setMenuOpen(isOpen) {
        navigation.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    }

    toggle.addEventListener("click", () => {
        setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    navigation.addEventListener("click", (event) => {
        if (event.target.closest("a")) setMenuOpen(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setMenuOpen(false);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 700) setMenuOpen(false);
    });
});
