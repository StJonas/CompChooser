# Competency Chooser

##Preperation
pip and anaconda were used for the installation

Create virtual environment:
conda create — name testEnv python=3.7
conda activate testEnv

Install nbextensions:
conda install -c conda-forge jupyter_contrib_nbextensions
After the installation there will be a tab in the Jupyter Notebooks menu called nbextensions - here all extensions are listed

Find the nbextensions folder:
pip show jupyter_contrib_nbextensions

The compChooser folder then has to be inserted into the nbextensions folder

##Installation
1. conda activate testEnv
2. go to nbextensions folder
3. jupyter nbextension install compChooser —user
4. jupyter nbextension enable compChooser/main

##Updating the Plugin
If changes have been made to the plugin step 3 and 4 from the installation have to be repeated. If the consol ouput is "OK" after the fourth step, the plugin was successfully updated