---
layout: page
title: Correction de TD
# Keeps "Teaching" highlighted in the menu on this page
parent: /teaching.html
---

[← Back to Programming and Databases]({{ '/teaching/programming-databases.html' | relative_url }})



## Correction de TD

**[Énoncés des TD – Programmation en Python, les bases (PDF)](https://ecampus.paris-saclay.fr/pluginfile.php/4773690/mod_folder/content/0/TD%20Python_2026.pdf?forcedownload=1)** (connexion eCampus requise).

### TD 1 à 4

#### Exercice Tranches d'âge

<details markdown="1">
<summary>Voir la correction</summary>

```python
# 1. Imports section
import random

# 2. Functions section
def age_evaluator_simplified(age):
    """
    This function prints a message depending on the age range
    """
    if 0 < age <= 10:
        return "Vous êtes un enfant"
    elif 17 >= age > 10:
        return "Vous êtes un adolescent"
    elif 64 >= age > 17:
        return "Vous êtes un adulte"
    elif 100 >= age > 64:
        return "Vous êtes un aı̂né"
    else:
        return "Vous avez un problème avec votre génerateur d'age"


# 3. Main routine section
if __name__ == "__main__":
    gerenated_age_1 = random.randint(1, 100)
    gerenated_age_2 = random.randint(1, 100)

    # This time, I save the age groups in variables because we'll use them multiple times.
    age_group_1 = age_evaluator_simplified(gerenated_age_1)
    age_group_2 = age_evaluator_simplified(gerenated_age_2)

    print(f"Vous avez {gerenated_age_1} ans, {age_group_1}")
    print(f"Vous avez {gerenated_age_2} ans, {age_group_2}")
    print(
        "c'est la meme tranche d'âge"
        if age_group_1 == age_group_2
        else "ce ne sont pas les mêmes tranches d'âge"
    )
```

</details>

#### Exercice Devine un nombre

<details markdown="1">
<summary>Voir la correction</summary>

```python
# 1. Imports section
import random

# 2. Functions section
# No functions in this excersise

# 3. Main routine section
if __name__ == "__main__":
    number = random.randint(1, 100)
    print("I have a number in mind. Would you be able to guess it !")
    continue_game = True
    counter = 0

    while continue_game and counter < 7:
        user_entry = input("Tap your guess \n")
        guess = int(user_entry)
        if guess == number:
            print(
                f"Congrats, you guessed the number, it was {number}\n you did it in {counter} tries"
            )
            continue_game = False
        else:
            if guess > number:
                print("Nice try, but that's not the number,")
                print(f"The number I'm thinking on is less than {guess}")
            else:
                print("Nice try, but that's not the number,")
                print(f"The number I'm thinking on is more than {guess}")
            counter += 1
            if counter == 7:
                print("Sorry, your tries are over :c")
```

</details>

#### Exercice Les stars

<details markdown="1">
<summary>Voir la correction</summary>

```python
# 1. Imports section
# It's empty as we don't need any external package on this script


# 2. Functions section
def make_triangle(n: int):
    """
    This function print a triangle of stars by simply printing
    a line of n stars and making n = n-1 for the next iteration.
    """
    for _ in range(n):
        line = n * "*"
        n -= 1
        print(line)


# 3. Main routine section
if __name__ == "__main__":
    base = int(input("Donnez la taille de la base de votre triangle d'étoiles : "))
    make_triangle(base)

```

</details>

#### Exercice Tri par insertion

<details markdown="1">
<summary>Voir la correction</summary>

```python
# 1. Imports section
# It's empty for now, as we don't need any external package on this script

# 2. Functions section
def insere(liste, elem):
    """
    Fonction qui inset un élement à sa bonne place dans une liste.
    """
    # First of all, we search the position for insering the element.
    i = 0
    while i < len(liste) and liste[i] < elem :
        i +=1
    # We insert elem in i position if it is not the last of the list
    if i < len(liste) :
        liste.insert(i,elem)
    # We insert elem at the end if it is the bigger element into the list
    else:
        liste.append(elem)

    return liste


def tri_par_insertion(liste):
    """
    Fonction qui trie une liste par insertion
    """
    liste_triee = []
    for el in liste :
        liste_triee = insere(liste_triee, el)
    return liste_triee

# 3. Main routine section
if __name__ == "__main__":
    print(insere([1,2,4,5,6,9,10], 11))
    print(tri_par_insertion([10,9,8,7,3,12,13,5,4,1,11,14,2]))
```

</details>
